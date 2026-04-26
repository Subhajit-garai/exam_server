import { db } from "@repo/db/index.js";
import { target_exams } from "@repo/db/schema/exam.js";
import { categories } from "@repo/db/schema/note.js";
import { eq } from "drizzle-orm";

export class TargetExamService {
    async fetchTargetedExamById(id: string) {
        const [target_exam] = await db.select()
            .from(target_exams)
            .where(eq(target_exams.id, id));

        if (!target_exam) throw Error("Target exam not found");
        return target_exam;
    }

    async getAvailableTargetExam(category: string) {
        const response = await db.select({
            name: target_exams.name,
            shortCode: target_exams.short_code,
            id: target_exams.id,
        })
            .from(target_exams)
            .innerJoin(categories, eq(target_exams.category_id, categories.id))
            .where(eq(categories.name, category));

        if (response.length === 0) {
            throw new Error("Can not find any exam");
        }

        return response;
    }

    async createTargetedExam(data: any) {
        let categoryId: string | null = null;

        if (data.category) {
            const [categoryData] = await db.select()
                .from(categories)
                .where(eq(categories.name, data.category));
            if (!categoryData) throw Error("category not found");
            categoryId = categoryData.id;
        }

        let { category, ...rest } = data;
        const [target_exam] = await db.insert(target_exams).values({
            ...rest,
            category_id: categoryId
        }).returning();

        return target_exam;
    }

    async getAvailableTargetExamAll() {
        const response = await db.select({
            name: target_exams.name,
            shortCode: target_exams.short_code,
            id: target_exams.id,
        }).from(target_exams);

        if (response.length === 0) {
            throw new Error("Can not find any exam");
        }

        return response;
    }
}

