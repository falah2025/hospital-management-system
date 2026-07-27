import { Router } from "express";
import { login, register, getMe } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/me", authenticate, getMe);
