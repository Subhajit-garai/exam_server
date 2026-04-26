import { Router } from "express";
import {
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../controllers/category.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const categoryAdminRouter = Router();

// Admin Routes (Protected)
categoryAdminRouter.post("/create", isAdmin, createCategory);
categoryAdminRouter.put("/update/:id", isAdmin, updateCategory);
categoryAdminRouter.delete("/delete/:id", isAdmin, deleteCategory);
