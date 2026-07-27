import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment,
} from "../controllers/billingController";

export const billingRouter = Router();

billingRouter.use(authenticate);

billingRouter.get("/invoices", authorize("ADMIN", "ACCOUNTANT", "RECEPTIONIST"), getInvoices);
billingRouter.get("/invoices/:id", authorize("ADMIN", "ACCOUNTANT", "RECEPTIONIST"), getInvoiceById);
billingRouter.post("/invoices", authorize("ADMIN", "ACCOUNTANT", "RECEPTIONIST"), createInvoice);
billingRouter.post("/payments", authorize("ADMIN", "ACCOUNTANT", "RECEPTIONIST"), recordPayment);
