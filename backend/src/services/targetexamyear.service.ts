import prisma from "@repo/db/index.js";
import { ConvertInSlug } from "@/lib/slug.js";



export class TargetExamYearService {




    async createTargetedExamYear(data: any) {
        let target_exam_data = await prisma.targetExam.findFirst({
            where: {
                id: data.targetExamId,
            },
        });

        if (!target_exam_data) throw new Error("Invalid exam name — please select a valid exam");

        data.slug = ConvertInSlug(
            `${target_exam_data.shortCode} ${data.year}`
        );

        let target_exam_year = await prisma.examYear.create({
            data: {
                ...data,
                slug: data.slug,
                year: parseInt(data.year),
            },
        });

        if (!target_exam_year) throw new Error("Failed to create target exam year");
        return target_exam_year;
    }
    async updateTargetedExamYear(data: any) {
        let isTargetdExam_Year = await prisma.examYear.findUnique({
            where: {
                id: data.exam_year_id,
            },
        });

        if (!isTargetdExam_Year) {
            throw new Error("Invalid exam year ID");
        }

        let updated_target_exam_year = await prisma.examYear.update({
            where: {
                id: data?.exam_year_id,
            },
            data: {
                ...(data.category ? { category: data.category } : undefined),
                ...(data.registrationOpenDate
                    ? { registrationOpenDate: data.registrationOpenDate }
                    : undefined),
                ...(data.registrationCloseDate
                    ? { registrationCloseDate: data.registrationCloseDate }
                    : undefined),
                ...(data.notes ? { notes: data.notes } : undefined),
                ...(data.status ? { status: data.status } : undefined),
                ...(data.slug ? { slug: data.slug } : undefined),
            },
        });

        return updated_target_exam_year;
    }
    async getExamYearInfo(examname: string, id: string) {
        let exam_year;
        if (id) {
            exam_year = await prisma.examYear.findFirst({
                where: {
                    id: id,
                },
            });
        } else {
            exam_year = await prisma.examYear.findMany({
                where: {
                    targetExam: {
                        shortCode: examname,
                    },
                },
            });
        }

        if (!exam_year) throw Error("Exam year info not found");
        return exam_year;
    }

}
