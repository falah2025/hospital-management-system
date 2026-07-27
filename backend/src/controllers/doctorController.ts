import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const doctorSchema = z.object({
  userId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  specialization: z.string().min(2),
  licenseNumber: z.string().min(3),
  education: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  workingHoursStart: z.string().optional(),
  workingHoursEnd: z.string().optional(),
});

export const getDoctors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const departmentId = req.query.departmentId as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { specialization: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true } },
          department: true,
          _count: { select: { appointments: true, medicalRecords: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctor.count({ where }),
    ]);

    res.json({
      success: true,
      data: doctors,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true } },
        department: true,
        appointments: {
          where: { appointmentDate: { gte: new Date() } },
          orderBy: { appointmentDate: "asc" },
          take: 10,
          include: { patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } } },
        },
      },
    });

    if (!doctor) throw createError("Doctor not found", 404);
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = doctorSchema.parse(req.body);
    const doctor = await prisma.doctor.create({
      data: {
        ...data,
        consultationFee: data.consultationFee ? data.consultationFee : undefined,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: true,
      },
    });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = doctorSchema.partial().parse(req.body);

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...data,
        consultationFee: data.consultationFee ? data.consultationFee : undefined,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        department: true,
      },
    });
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const getDoctorSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const date = req.query.date as string;

    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        appointmentDate: { gte: startOfDay, lte: endOfDay },
        status: { not: "CANCELLED" },
      },
      include: {
        patient: { select: { firstName: true, lastName: true, patientNumber: true } },
      },
      orderBy: { appointmentDate: "asc" },
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};
