import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getLabTests,
  createLabTest,
  updateLabResult,
  getRadiologyScans,
  createRadiologyScan,
  updateRadiologyReport,
} from "../controllers/labController";

export const labRouter = Router();

labRouter.use(authenticate);

labRouter.get("/tests", authorize("ADMIN", "DOCTOR", "LAB_TECHNICIAN", "NURSE"), getLabTests);
labRouter.post("/tests", authorize("ADMIN", "DOCTOR"), createLabTest);
labRouter.put("/tests/:id/result", authorize("ADMIN", "LAB_TECHNICIAN"), updateLabResult);

labRouter.get("/radiology", authorize("ADMIN", "DOCTOR", "RADIOLOGIST", "NURSE"), getRadiologyScans);
labRouter.post("/radiology", authorize("ADMIN", "DOCTOR"), createRadiologyScan);
labRouter.put("/radiology/:id/report", authorize("ADMIN", "RADIOLOGIST"), updateRadiologyReport);
