import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const invoiceSchema = z.object({
  patientId: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    serviceType: z.enum(["CONSULTATION", "MEDICINE", "LAB", "RADIOLOGY", "ROOM", "SURGERY", "PROCEDURE", "OTHER"]),
    description: z.string(),
    quantity: z.number().int().min(1),
    unitPrice: z.number().min(0),
  })).min(1),
});

const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().min(0.01),
  paymentMethod: z.enum(["CASH", "CARD", "BANK_TRANSFER", "INSURANCE", "MOBILE_PAYMENT"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const patientId = req.query.patientId as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { select: { firstName: true, lastName: true, patientNumber: true } },
          details: true,
          payments: true,
          _count: { select: { payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      success: true,
      data: invoices,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        details: true,
        payments: true,
        insuranceClaims: true,
      },
    });
    if (!invoice) throw createError("Invoice not found", 404);
    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = invoiceSchema.parse(req.body);

    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const totalAmount = subtotal - discount + tax;

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const invoice = await prisma.invoice.create({
      data: {
        patientId: data.patientId,
        invoiceNumber,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        totalAmount,
        dueAmount: totalAmount,
        discount,
        tax,
        notes: data.notes,
        details: {
          create: data.items.map((item) => ({
            serviceType: item.serviceType,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        details: true,
      },
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = paymentSchema.parse(req.body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) throw createError("Invoice not found", 404);
    if (invoice.status === "PAID") throw createError("Invoice is already fully paid", 409);

    const newPaidAmount = Number(invoice.paidAmount) + data.amount;
    const newDueAmount = Number(invoice.totalAmount) - newPaidAmount;

    let status = "PARTIALLY_PAID";
    if (newDueAmount <= 0) status = "PAID";
    if (newDueAmount < 0) throw createError("Payment exceeds invoice amount", 400);

    const [payment] = await prisma.$transaction([
      prisma.payment.create({ data }),
      prisma.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          dueAmount: newDueAmount,
          status: status as any,
        },
      }),
    ]);

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};
