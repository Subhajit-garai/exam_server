import { Router } from "express";
import { getDashboardStats, getPayments } from "./controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", getDashboardStats);
dashboardRouter.get("/payments", getPayments);
