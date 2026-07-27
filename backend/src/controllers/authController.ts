import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../server";
import { generateToken } from "../utils/jwt";
import { createError } from "../middleware/errorHandler";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  roleName: z.string().default("RECEPTIONIST"),
});

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) {
      throw createError("Invalid credentials", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError("Invalid credentials", 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map((ur) => ur.role.name),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Find or create role
    let role = await prisma.role.findUnique({ where: { name: data.roleName } });
    if (!role) {
      role = await prisma.role.create({
        data: { name: data.roleName, description: `Auto-created ${data.roleName} role` },
      });
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        roles: {
          create: { roleId: role.id },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.name),
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map((ur) => ur.role.name),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw createError("Not authenticated", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
        doctor: { include: { department: true } },
        staff: { include: { department: true } },
      },
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        roles: user.roles.map((ur) => ur.role.name),
        permissions: user.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name)
        ),
        doctor: user.doctor,
        staff: user.staff,
      },
    });
  } catch (error) {
    next(error);
  }
};
