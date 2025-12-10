import { Router } from "express";
import {
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategories
} from "@/controllers/category.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const categoryAdminRouter = Router();
export const categoryPublicRouter = Router();

// Public Routes
categoryPublicRouter.get("/all", getCategories);
categoryPublicRouter.get("/:id", getCategoryById);

// Admin Routes (Protected)
categoryAdminRouter.post("/create", isAdmin, createCategory);
categoryAdminRouter.put("/update/:id", isAdmin, updateCategory);
categoryAdminRouter.delete("/delete/:id", isAdmin, deleteCategory);
