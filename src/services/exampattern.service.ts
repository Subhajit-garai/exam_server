import { db } from "@repo/db/index.js";
import { exam_patterns, exam_years, target_exams, exams } from "@repo/db/schema/exam.js";
import { syllabuses } from "@repo/db/schema/syllabus.js";
import { categories } from "@repo/db/schema/note.js";
import { eq, and } from "drizzle-orm";

export class ExampatternService {
    async createExamPattern(data: any, userId: string) {
        let {
            title,
            checkbox,
            format,
            examname,
            category,
            topics,
            difficulty,
            part,
            part_Count,
            total_questions,
            checktype,
            marks_values,
            neg_values,
            examyear,
            syllabus,
        } = data;

        let syllabusData;

        if (checkbox) {
            if (!syllabus) throw Error("syllabus not found");

            const examYearDataList = await db.select({
                id: exam_years.id
            })
                .from(exam_years)
                .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
                .where(
                    and(
                        eq(target_exams.name, examname),
                        eq(exam_years.year, parseInt(examyear))
                    )
                );

            if (examYearDataList.length === 0) throw Error("examYearData not found");
            const examYearData = examYearDataList[0];

            const [foundSyllabus] = await db.select({ id: syllabuses.id })
                .from(syllabuses)
                .where(
                    and(
                        eq(syllabuses.exam_year_id, examYearData.id),
                        eq(syllabuses.title, syllabus)
                    )
                );

            if (!foundSyllabus) throw Error("syllabusdata not found");
            syllabusData = foundSyllabus;
        } else {
            if ((topics?.length as number) < 1) {
                throw new Error("Topics is Empty");
            }
        }

        let categoryId: string | null = null;
        if (category) {
            const [cat] = await db.select({ id: categories.id })
                .from(categories)
                .where(eq(categories.name, category));
            if (cat) categoryId = cat.id;
        }

        const [response] = await db.insert(exam_patterns).values({
            title,
            format,
            exam_name: examname,
            category_id: categoryId,
            topics,
            difficulty,
            part,
            part_count: parseInt(part_Count),
            total_questions,
            check: checktype,
            checkbox,
            marks_values,
            neg_values,
            syllabus: checkbox ? "Syllabus" : "Generic",
            syllabus_id: syllabusData?.id,
            created_by: userId
        }).returning();

        if (!response) throw Error("exam pattern not created");

        return response;
    }

    async updateExamPattern(data: any, userId: string) {
        let { id, ...updateData } = data;

        let syllabusData;
        if (updateData.checkbox && updateData.syllabus && updateData.examname && updateData.examyear) {
            const examYearDataList = await db.select({
                id: exam_years.id
            })
                .from(exam_years)
                .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
                .where(
                    and(
                        eq(target_exams.name, updateData.examname),
                        eq(exam_years.year, parseInt(updateData.examyear))
                    )
                );

            if (examYearDataList.length > 0) {
                const examYearData = examYearDataList[0];
                const [foundSyllabus] = await db.select({ id: syllabuses.id })
                    .from(syllabuses)
                    .where(
                        and(
                            eq(syllabuses.exam_year_id, examYearData.id),
                            eq(syllabuses.title, updateData.syllabus)
                        )
                    );
                syllabusData = foundSyllabus;
                delete updateData.syllabus;
            }
        }

        if (updateData.category) {
            const [categoryData] = await db.select({ id: categories.id })
                .from(categories)
                .where(eq(categories.name, updateData.category));

            if (!categoryData) throw Error("category not found");
            updateData.category_id = categoryData.id;

            if (updateData.checktype) {
                updateData.check = updateData.checktype;
            }
            delete updateData.category;
            delete updateData.examyear;
            delete updateData.checktype;
        }

        if (updateData.examname) {
            updateData.exam_name = updateData.examname;
            delete updateData.examname;
        }

        const [response] = await db.update(exam_patterns).set({
            ...updateData,
            ...(updateData.part_Count && { part_count: parseInt(updateData.part_Count) }),
            ...(syllabusData && { syllabus_id: syllabusData.id }),
        }).where(eq(exam_patterns.id, id)).returning();

        return response;
    }

    async getExamPatternById(id: string) {
        const [response] = await db.select()
            .from(exam_patterns)
            .leftJoin(categories, eq(exam_patterns.category_id, categories.id))
            .where(eq(exam_patterns.id, id));

        if (!response) throw new Error("Exam Pattern not found");
        return response;
    }

    async getAvailableExamPattern(exam: string, userId: string) {
        const response = await db.select({
            id: exam_patterns.id,
            title: exam_patterns.title,
            examname: exam_patterns.exam_name,
            difficulty: exam_patterns.difficulty,
            format: exam_patterns.format,
        })
            .from(exam_patterns)
            .where(
                and(
                    eq(exam_patterns.exam_name, exam),
                    eq(exam_patterns.created_by, userId)
                )
            );

        if (response.length === 0) {
            throw new Error("Can not find any exampattern");
        }

        return response;
    }

    async deleteExamPattern(id: string) {
        const [usage] = await db.select({ id: exams.id })
            .from(exams)
            .where(eq(exams.exam_pattern_id, id));

        if (usage) throw new Error("Cannot delete pattern: It is used in one or more Exams.");

        const [response] = await db.delete(exam_patterns)
            .where(eq(exam_patterns.id, id))
            .returning();

        return response;
    }
}

