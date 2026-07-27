import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  appointmentDate: z.string().datetime(),
  duration: z.number().int().min(5).max(240).optional(),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY", "PROCEDURE", "CHECKUP"]).optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export const getAppointments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const patientId = req.query.patientId as string;
    const doctorId = req.query.doctorId as string;
    const status = req.query.status as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.appointmentDate = {};
      if (dateFrom) where.appointmentDate.gte = new Date(dateFrom);
      if (dateTo) where.appointmentDate.lte = new Date(dateTo);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appointmentDate: "desc" },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true, phoneNumber: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: appointments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!appointment) throw createError("Appointment not found", 404);
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = appointmentSchema.parse(req.body);

    // Check for conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        status: { not: "CANCELLED" },
        appointmentDate: {
          gte: new Date(new Date(data.appointmentDate).getTime() - 30 * 60000),
          lte: new Date(new Date(data.appointmentDate).getTime() + 30 * 60000),
        },
      },
    });

    if (conflict) {
      throw createError("Time slot is already booked", 409);
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...data,
        appointmentDate: new Date(data.appointmentDate),
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = appointmentSchema.partial().parse(req.body);

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...data,
        ...(data.appointmentDate && { appointmentDate: new Date(data.appointmentDate) }),
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED", notes: reason || undefined },
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
