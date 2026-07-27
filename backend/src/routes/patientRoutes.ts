import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patientController";

export const patientRouter = Router();

patientRouter.use(authenticate);

patientRouter.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"), getPatients);
patientRouter.get("/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"), getPatientById);
patientRouter.post("/", authorize("ADMIN", "RECEPTIONIST"), createPatient);
patientRouter.put("/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), updatePatient);
patientRouter.delete("/:id", authorize("ADMIN"), deletePatient);
