import { ConvertInSlug } from "@/utils/slug.js";
import { db } from "@repo/db/index.js";
import { categories } from "@repo/db/schema/note.js";
import { eq, or, and, not } from "drizzle-orm";
import { exam_patterns, target_exams } from "@repo/db/schema/exam.js";

export class CategoryService {

    async createCategory(data: any) {
        const slug = data.slug || ConvertInSlug(data.name);

        const [existing] = await db.select().from(categories).where(or(
            eq(categories.name, data.name),
            eq(categories.slug, slug)
        )).limit(1);

        if (existing) {
            throw new Error("Category with same name or slug already exists");
        }

        const [category] = await db.insert(categories).values({
            name: data.name,
            slug: slug,
            short_name: data.shortName,
            description: data.description,
            icon_url: data.iconUrl,
            updated_at: new Date()
        }).returning();
        return category;
    }

    async getCategory() {
        const response = await db.select().from(categories);
        if (!response) {
            throw new Error("Can not find any Category");
        }
        return response;
    }

    async getCategoryById(id: string) {
        const [categoryData] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
        if (!categoryData) throw new Error("Category not found");

        const examPatterns = await db.select().from(exam_patterns).where(eq(exam_patterns.category_id, id));
        const targetExams = await db.select().from(target_exams).where(eq(target_exams.category_id, id));

        return {
            ...categoryData,
            examPatterns,
            targetExams
        };
    }

    async updateCategory(id: string, data: any) {
        await this.getCategoryById(id);

        if (data.name || data.slug) {
            const slug = data.slug || (data.name ? ConvertInSlug(data.name) : undefined);

            const [existing] = await db.select().from(categories).where(and(
                not(eq(categories.id, id)),
                or(
                    data.name ? eq(categories.name, data.name) : undefined,
                    slug ? eq(categories.slug, slug) : undefined
                )
            )).limit(1);

            if (existing) throw new Error("Category name or slug already taken");

            if (!data.slug && data.name) {
                data.slug = slug;
            }
        }

        const [updatedCategory] = await db.update(categories).set({
            name: data.name,
            slug: data.slug,
            short_name: data.shortName,
            description: data.description,
            icon_url: data.iconUrl,
            updated_at: new Date()
        }).where(eq(categories.id, id)).returning();

        return updatedCategory;
    }

    async deleteCategory(id: string) {
        const [deletedCategory] = await db.delete(categories).where(eq(categories.id, id)).returning();
        return deletedCategory;
    }
}

export const categoryService = new CategoryService();
