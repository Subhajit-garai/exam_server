import { asyncHandler } from "@repo/lib/helper/asyncHandler.js";
import { createCategorySchema, updateCategorySchema } from "@/zod/category.zod.js";
import { categoryService } from "@/services/category.service.js";

export const createCategory = asyncHandler(async (req: any, res: any) => {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const category = await categoryService.createCategory(result.data);
    return res.status(201).json({ success: true, message: "Category created", data: category });
});

export const getCategories = asyncHandler(async (req: any, res: any) => {
    const categories = await categoryService.getCategory();
    return res.json({ success: true, data: categories });
});

export const getCategoryById = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    return res.json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: any, res: any) => {
    const result = updateCategorySchema.safeParse({ ...req.body, id: req.params.id || req.body.id });
    if (!result.success) {
        return res.status(400).json({ success: false, message: "Invalid input", errors: result.error.errors });
    }

    const category = await categoryService.updateCategory(result.data.id, result.data);
    return res.json({ success: true, message: "Category updated", data: category });
});

export const deleteCategory = asyncHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    return res.json({ success: true, message: "Category deleted" });
});
