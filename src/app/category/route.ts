import { Router } from "express";
import {
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategories,
} from "./controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const categoryPublicRouter = Router();
export const categoryAdminRouter = Router();

// Public Routes
categoryPublicRouter.get("/all", getCategories);
categoryPublicRouter.get("/:id", getCategoryById);

// Admin Routes (Protected)
categoryAdminRouter.post("/create", isAdmin, createCategory);
categoryAdminRouter.put("/update/:id", isAdmin, updateCategory);
categoryAdminRouter.delete("/delete/:id", isAdmin, deleteCategory);
