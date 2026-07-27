import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const medicineSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().optional(),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().optional(),
  unitPrice: z.number().min(0),
  stockQuantity: z.number().int().min(0).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  expiryDate: z.string().datetime().optional(),
  batchNumber: z.string().optional(),
});

export const getMedicines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const lowStock = req.query.lowStock === "true";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { genericName: { contains: search, mode: "insensitive" } },
      ];
    }
    if (lowStock) {
      where.stockQuantity = { lte: prisma.medicine.fields.reorderLevel };
    }

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.medicine.count({ where }),
    ]);

    res.json({
      success: true,
      data: medicines,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicineById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const medicine = await prisma.medicine.findUnique({
      where: { id },
      include: {
        inventoryMovements: { orderBy: { createdAt: "desc" }, take: 20 },
        prescriptionDetails: {
          take: 10,
          include: { prescription: { include: { patient: { select: { firstName: true, lastName: true } } } } },
        },
      },
    });
    if (!medicine) throw createError("Medicine not found", 404);
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

export const createMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = medicineSchema.parse(req.body);
    const medicine = await prisma.medicine.create({
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

export const updateMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = medicineSchema.partial().parse(req.body);
    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
};

export const dispensePrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prescriptionId } = req.body;

    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { details: { include: { medicine: true } } },
    });

    if (!prescription) throw createError("Prescription not found", 404);
    if (prescription.status === "DISPENSED") throw createError("Already dispensed", 409);

    // Check stock and update
    for (const detail of prescription.details) {
      if (detail.medicine.stockQuantity < detail.quantity) {
        throw createError(`Insufficient stock for ${detail.medicine.name}`, 409);
      }
    }

    await prisma.$transaction([
      prisma.prescription.update({
        where: { id: prescriptionId },
        data: { status: "DISPENSED" },
      }),
      ...prescription.details.map((detail) =>
        prisma.medicine.update({
          where: { id: detail.medicineId },
          data: { stockQuantity: { decrement: detail.quantity } },
        })
      ),
      ...prescription.details.map((detail) =>
        prisma.inventoryMovement.create({
          data: {
            medicineId: detail.medicineId,
            type: "OUT",
            quantity: -detail.quantity,
            referenceId: prescriptionId,
            notes: `Dispensed for prescription ${prescriptionId}`,
          },
        })
      ),
    ]);

    res.json({ success: true, message: "Prescription dispensed successfully" });
  } catch (error) {
    next(error);
  }
};
