import { ExampatternInputType } from "@/zod/user.zod";
import prisma from "@repo/db/index.js";
import { syllabusType } from "@repo/prisma/enums";


export class ExampatternService {


    async createExamPattern(data: ExampatternInputType, userId: string) {
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
            if (!syllabus) throw Error("syllabus not found ");

            let examYearData = await prisma.examYear.findFirst({
                where: {
                    targetExam: {
                        name: examname,
                    },
                    year: parseInt(examyear),
                },
            });

            if (!examYearData) throw Error("examYearData not found ");

            syllabusData = await prisma.syllabus.findFirst({
                where: {
                    exam_year_id: examYearData.id,
                    title: syllabus,
                },
            });

            if (!syllabusData) throw Error("syllabusdata not found ");

        } else {
            if ((topics?.length as number) < 1) {
                throw new Error("Topics is Empty ");
            }
        }

        let response = await prisma.exam_pattern.create({
            data: {
                title,
                format,
                examname,
                ...(category ? { Category: { connect: { name: category } } } : {}),
                topics,
                difficulty,
                part,
                part_Count: parseInt(part_Count),
                total_questions,
                check: checktype,
                checkbox,
                marks_values,
                neg_values,
                syllabus: checkbox ? syllabusType.Syllabus : syllabusType.Generic,
                ...(syllabusData && { syllabusid: syllabusData.id }),
                User: {
                    connect: { id: userId },
                },
            },
        });

        if (!response) throw Error(" exam patten not created ");

        return response;
    }

    async updateExamPattern(data: any, userId: string) {
        let { id, ...updateData } = data;

        // Remove fields that shouldn't be updated or transform them if needed
        if (updateData.checkbox && !updateData.syllabus) {
            // If checkbox is enabling syllabus but syllabus not provided, we might need logic here
            // but schema validation should handle it.
            // For now, pass all data.
        }

        // Logic similar to create for syllabus mapping if needed
        let syllabusData;
        if (updateData.checkbox && updateData.syllabus && updateData.examname && updateData.examyear) {
            let examYearData = await prisma.examYear.findFirst({
                where: {
                    targetExam: { name: updateData.examname },
                    year: parseInt(updateData.examyear),
                },
            });
            if (examYearData) {
                syllabusData = await prisma.syllabus.findFirst({
                    where: { exam_year_id: examYearData.id, title: updateData.syllabus },
                });

                delete updateData.syllabus

            }


        }

        if (updateData.category) {
            let categoryData = await prisma.category.findFirst({
                where: {
                    name: updateData.category,
                },
            });
            if (!categoryData) throw Error("category not found ");
            updateData.categoryId = categoryData.id;

            if (updateData.checktype) {
                updateData.check = updateData.checktype
            }
            delete updateData.category
            delete updateData.examyear
            delete updateData.checktype
        }

        let response = await prisma.exam_pattern.update({
            where: { id: id },
            data: {
                ...updateData,
                ...(updateData.part_Count && { part_Count: parseInt(updateData.part_Count) }),
                ...(syllabusData && { syllabusid: syllabusData.id }),
            }
        });
        return response;
    }

    async getExamPatternById(id: string) {
        let response = await prisma.exam_pattern.findUnique({
            where: { id: id },
            include: {
                Category: true
            }
        });
        if (!response) throw new Error("Exam Pattern not found");
        return response;
    }

    async getAvailableExamPattern(exam: string, userId: string) {
        let response = await prisma.exam_pattern.findMany({
            where: {
                examname: exam,
                created_by: userId,
            },
            select: {
                id: true,
                title: true,
                examname: true,
                difficulty: true,
                format: true,
            },
        });

        if (!response) {
            throw new Error("Can not find any exampattern");
        }

        return response;
    }

    async deleteExamPattern(id: string) {
        // Check if used in any Exam
        let usage = await prisma.exam.findFirst({
            where: { exam_pattern_id: id }
        });
        if (usage) throw new Error("Cannot delete pattern: It is used in one or more Exams.");

        let response = await prisma.exam_pattern.delete({
            where: { id: id }
        });
        return response;
    }
}