import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from "../controllers/appointmentController";

export const appointmentRouter = Router();

appointmentRouter.use(authenticate);

appointmentRouter.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"), getAppointments);
appointmentRouter.get("/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"), getAppointmentById);
appointmentRouter.post("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), createAppointment);
appointmentRouter.put("/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), updateAppointment);
appointmentRouter.patch("/:id/cancel", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), cancelAppointment);
