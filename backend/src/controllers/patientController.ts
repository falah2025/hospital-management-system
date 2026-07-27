import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const patientSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationalId: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  bloodGroup: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
});

const generatePatientNumber = (): string => {
  const prefix = "PT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const getPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { patientNumber: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
        { nationalId: { contains: search } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { appointments: true, medicalRecords: true, invoices: true },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json({
      success: true,
      data: patients,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { appointmentDate: "desc" },
          take: 10,
          include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
        medicalRecords: {
          orderBy: { recordDate: "desc" },
          take: 10,
          include: { doctor: { include: { user: { select: { firstName: true, lastName: true } } } } },
        },
        bedOccupancies: {
          where: { dischargeDateActual: null },
          include: { bed: { include: { room: true } } },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!patient) {
      throw createError("Patient not found", 404);
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = patientSchema.parse(req.body);

    const patient = await prisma.patient.create({
      data: {
        ...data,
        patientNumber: generatePatientNumber(),
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = patientSchema.partial().parse(req.body);

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
      },
    });

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.patient.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ success: true, message: "Patient deactivated successfully" });
  } catch (error) {
    next(error);
  }
};
