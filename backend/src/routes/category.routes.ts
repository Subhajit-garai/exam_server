import { Router } from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "@/controllers/category.controller.js";
import { isAdmin } from "@repo/lib/security/auth.js";

export const categoryRouter = Router();

categoryRouter.post("/create", isAdmin, createCategory);
categoryRouter.get("/:id", isAdmin, getCategoryById);
categoryRouter.put("/update/:id", isAdmin, updateCategory);
categoryRouter.delete("/delete/:id", isAdmin, deleteCategory);
