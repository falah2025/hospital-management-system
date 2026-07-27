import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  assignBed,
  dischargePatient,
} from "../controllers/roomController";

export const roomRouter = Router();

roomRouter.use(authenticate);

roomRouter.get("/", authorize("ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"), getRooms);
roomRouter.get("/:id", authorize("ADMIN", "RECEPTIONIST", "NURSE", "DOCTOR"), getRoomById);
roomRouter.post("/", authorize("ADMIN"), createRoom);
roomRouter.put("/:id", authorize("ADMIN"), updateRoom);
roomRouter.post("/assign-bed", authorize("ADMIN", "RECEPTIONIST", "NURSE"), assignBed);
roomRouter.post("/discharge/:occupancyId", authorize("ADMIN", "DOCTOR", "NURSE"), dischargePatient);
