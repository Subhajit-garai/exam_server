import { Router } from "express";
import {
    getCategoryById,
    getCategories
} from "@/controllers/category.controller.js";

export const categoryPublicRouter = Router();

// Public Routes
categoryPublicRouter.get("/all", getCategories);
categoryPublicRouter.get("/:id", getCategoryById);

