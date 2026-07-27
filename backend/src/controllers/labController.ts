import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const labTestSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  medicalRecordId: z.string().uuid().optional(),
  testName: z.string().min(2),
  testCategory: z.string().optional(),
  notes: z.string().optional(),
});

const labResultSchema = z.object({
  resultValue: z.string(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  notes: z.string().optional(),
  filePath: z.string().optional(),
});

export const getLabTests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const patientId = req.query.patientId as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [tests, total] = await Promise.all([
      prisma.labTest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestDate: "desc" },
        include: {
          patient: { select: { firstName: true, lastName: true, patientNumber: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.labTest.count({ where }),
    ]);

    res.json({
      success: true,
      data: tests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const createLabTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = labTestSchema.parse(req.body);
    const test = await prisma.labTest.create({
      data,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
};

export const updateLabResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = labResultSchema.parse(req.body);

    const test = await prisma.labTest.update({
      where: { id },
      data: {
        ...data,
        resultDate: new Date(),
        status: "COMPLETED",
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    res.json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
};

// Radiology
const radiologySchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  medicalRecordId: z.string().uuid().optional(),
  scanType: z.string().min(2),
  findings: z.string().optional(),
  impression: z.string().optional(),
  filePath: z.string().optional(),
});

export const getRadiologyScans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const patientId = req.query.patientId as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (patientId) where.patientId = patientId;

    const [scans, total] = await Promise.all([
      prisma.radiology.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestDate: "desc" },
        include: {
          patient: { select: { firstName: true, lastName: true, patientNumber: true } },
          doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.radiology.count({ where }),
    ]);

    res.json({
      success: true,
      data: scans,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const createRadiologyScan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = radiologySchema.parse(req.body);
    const scan = await prisma.radiology.create({
      data,
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.status(201).json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};

export const updateRadiologyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = radiologySchema.partial().parse(req.body);

    const scan = await prisma.radiology.update({
      where: { id },
      data: {
        ...data,
        reportDate: new Date(),
        status: "COMPLETED",
      },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });

    res.json({ success: true, data: scan });
  } catch (error) {
    next(error);
  }
};
