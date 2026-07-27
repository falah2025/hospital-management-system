import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getEmergencyVisits,
  createEmergencyVisit,
  updateEmergencyVisit,
  dischargeEmergency,
} from "../controllers/emergencyController";

export const emergencyRouter = Router();

emergencyRouter.use(authenticate);

emergencyRouter.get("/", authorize("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"), getEmergencyVisits);
emergencyRouter.post("/", authorize("ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"), createEmergencyVisit);
emergencyRouter.put("/:id", authorize("ADMIN", "DOCTOR", "NURSE"), updateEmergencyVisit);
emergencyRouter.post("/:id/discharge", authorize("ADMIN", "DOCTOR"), dischargeEmergency);
