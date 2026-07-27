import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getDashboardStats, getRecentActivity } from "../controllers/dashboardController";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get("/stats", getDashboardStats);
dashboardRouter.get("/activity", getRecentActivity);
