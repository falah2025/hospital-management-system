import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  dispensePrescription,
} from "../controllers/pharmacyController";

export const pharmacyRouter = Router();

pharmacyRouter.use(authenticate);

pharmacyRouter.get("/medicines", authorize("ADMIN", "PHARMACIST", "DOCTOR", "NURSE"), getMedicines);
pharmacyRouter.get("/medicines/:id", authorize("ADMIN", "PHARMACIST", "DOCTOR"), getMedicineById);
pharmacyRouter.post("/medicines", authorize("ADMIN", "PHARMACIST"), createMedicine);
pharmacyRouter.put("/medicines/:id", authorize("ADMIN", "PHARMACIST"), updateMedicine);
pharmacyRouter.post("/dispense", authorize("ADMIN", "PHARMACIST"), dispensePrescription);
