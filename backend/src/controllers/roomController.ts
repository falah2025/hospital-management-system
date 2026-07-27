import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../server";
import { createError } from "../middleware/errorHandler";

const roomSchema = z.object({
  roomNumber: z.string().min(1),
  roomType: z.enum(["PRIVATE", "SEMI_PRIVATE", "WARD", "ICU", "NICU", "EMERGENCY", "OPERATION"]),
  departmentId: z.string().uuid().optional(),
  capacity: z.number().int().min(1).optional(),
  floor: z.string().optional(),
});

export const getRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departmentId = req.query.departmentId as string;
    const status = req.query.status as string;

    const where: any = {};
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        department: true,
        beds: {
          include: {
            occupancies: {
              where: { dischargeDateActual: null },
              include: { patient: { select: { firstName: true, lastName: true, patientNumber: true } } },
            },
          },
        },
        _count: { select: { beds: true } },
      },
      orderBy: { roomNumber: "asc" },
    });

    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        department: true,
        beds: {
          include: {
            occupancies: {
              where: { dischargeDateActual: null },
              include: { patient: true },
            },
          },
        },
      },
    });
    if (!room) throw createError("Room not found", 404);
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = roomSchema.parse(req.body);
    const room = await prisma.room.create({
      data,
      include: { department: true },
    });
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = roomSchema.partial().parse(req.body);
    const room = await prisma.room.update({
      where: { id },
      data,
      include: { department: true },
    });
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

export const assignBed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bedId, patientId, dischargeDateExpected, admissionReason } = req.body;

    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed || bed.status !== "AVAILABLE") {
      throw createError("Bed is not available", 409);
    }

    const [occupancy] = await prisma.$transaction([
      prisma.bedOccupancy.create({
        data: {
          bedId,
          patientId,
          dischargeDateExpected: dischargeDateExpected ? new Date(dischargeDateExpected) : undefined,
          admissionReason,
        },
      }),
      prisma.bed.update({
        where: { id: bedId },
        data: { status: "OCCUPIED" },
      }),
    ]);

    res.status(201).json({ success: true, data: occupancy });
  } catch (error) {
    next(error);
  }
};

export const dischargePatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { occupancyId } = req.params;
    const { dischargeNotes } = req.body;

    const occupancy = await prisma.bedOccupancy.findUnique({
      where: { id: occupancyId },
      include: { bed: true },
    });

    if (!occupancy) throw createError("Occupancy record not found", 404);

    await prisma.$transaction([
      prisma.bedOccupancy.update({
        where: { id: occupancyId },
        data: { dischargeDateActual: new Date(), dischargeNotes },
      }),
      prisma.bed.update({
        where: { id: occupancy.bedId },
        data: { status: "CLEANING" },
      }),
    ]);

    res.json({ success: true, message: "Patient discharged successfully" });
  } catch (error) {
    next(error);
  }
};
