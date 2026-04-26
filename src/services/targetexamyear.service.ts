import { ConvertInSlug } from "@/utils/slug.js";
import { db } from "@repo/db/index.js";
import { target_exams, exam_years } from "@repo/db/schema/exam.js";
import { eq } from "drizzle-orm";

export class TargetExamYearService {
    async createTargetedExamYear(data: any) {
        const [target_exam_data] = await db.select()
            .from(target_exams)
            .where(eq(target_exams.id, data.targetExamId));

        if (!target_exam_data) throw new Error("Invalid exam name — please select a valid exam");

        data.slug = ConvertInSlug(
            `${target_exam_data.short_code} ${data.year}`
        );

        const [target_exam_year] = await db.insert(exam_years).values({
            ...data,
            target_exam_id: data.targetExamId,
            slug: data.slug,
            year: parseInt(data.year),
            updated_at: new Date()
        }).returning();

        if (!target_exam_year) throw new Error("Failed to create target exam year");
        return target_exam_year;
    }

    async updateTargetedExamYear(data: any) {
        const [isTargetdExam_Year] = await db.select()
            .from(exam_years)
            .where(eq(exam_years.id, data.exam_year_id));

        if (!isTargetdExam_Year) {
            throw new Error("Invalid exam year ID");
        }

        const [updated_target_exam_year] = await db.update(exam_years).set({
            ...(data.registrationOpenDate
                ? { registration_open_date: data.registrationOpenDate }
                : undefined),
            ...(data.registrationCloseDate
                ? { registration_close_date: data.registrationCloseDate }
                : undefined),
            ...(data.notes ? { notes: data.notes } : undefined),
            ...(data.status ? { status: data.status } : undefined),
            ...(data.slug ? { slug: data.slug } : undefined),
            updated_at: new Date()
        }).where(eq(exam_years.id, data.exam_year_id)).returning();

        return updated_target_exam_year;
    }

    async getExamYearInfo(examname: string, id: string) {
        let exam_year;
        if (id) {
            const result = await db.select()
                .from(exam_years)
                .where(eq(exam_years.id, id));
            exam_year = result.length > 0 ? result[0] : null;
        } else {
            exam_year = await db.select({
                id: exam_years.id,
                targetExamId: exam_years.target_exam_id,
                year: exam_years.year,
                slug: exam_years.slug,
                status: exam_years.status,
                isPublic: exam_years.is_public,
                registrationOpenDate: exam_years.registration_open_date,
                registrationCloseDate: exam_years.registration_close_date,
                examDate: exam_years.exam_date,
                resultDate: exam_years.result_date,
                notes: exam_years.notes,
                createdAt: exam_years.created_at,
                updatedAt: exam_years.updated_at,
                isDeleted: exam_years.is_deleted
            })
                .from(exam_years)
                .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
                .where(eq(target_exams.short_code, examname));
        }

        if (!exam_year) throw Error("Exam year info not found");
        return exam_year;
    }
}

