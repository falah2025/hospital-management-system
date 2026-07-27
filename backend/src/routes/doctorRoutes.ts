import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  getDoctorSchedule,
} from "../controllers/doctorController";

export const doctorRouter = Router();

doctorRouter.use(authenticate);

doctorRouter.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"), getDoctors);
doctorRouter.get("/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"), getDoctorById);
doctorRouter.get("/:id/schedule", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), getDoctorSchedule);
doctorRouter.post("/", authorize("ADMIN"), createDoctor);
doctorRouter.put("/:id", authorize("ADMIN", "DOCTOR"), updateDoctor);
