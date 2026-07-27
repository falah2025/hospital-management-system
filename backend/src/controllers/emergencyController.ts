import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const emergencySchema = z.object({
  patientId: z.string().uuid().optional(),
  triageLevel: z.enum(["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5"]).optional(),
  chiefComplaint: z.string().min(2),
  vitalSigns: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export const getEmergencyVisits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [visits, total] = await Promise.all([
      prisma.emergencyVisit.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { triageLevel: "asc" },
          { arrivalTime: "asc" },
        ],
        include: {
          patient: { select: { firstName: true, lastName: true, patientNumber: true, bloodGroup: true } },
        },
      }),
      prisma.emergencyVisit.count({ where }),
    ]);

    res.json({
      success: true,
      data: visits,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const createEmergencyVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = emergencySchema.parse(req.body);

    const visit = await prisma.emergencyVisit.create({
      data: {
        ...data,
        triageLevel: data.triageLevel || "LEVEL_3",
      },
      include: {
        patient: { select: { firstName: true, lastName: true, patientNumber: true } },
      },
    });

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = emergencySchema.partial().parse(req.body);

    const visit = await prisma.emergencyVisit.update({
      where: { id },
      data,
      include: {
        patient: { select: { firstName: true, lastName: true } },
      },
    });

    res.json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};

export const dischargeEmergency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const visit = await prisma.emergencyVisit.update({
      where: { id },
      data: {
        status: "DISCHARGED",
        dischargeTime: new Date(),
        notes: notes || undefined,
      },
    });

    res.json({ success: true, data: visit });
  } catch (error) {
    next(error);
  }
};
