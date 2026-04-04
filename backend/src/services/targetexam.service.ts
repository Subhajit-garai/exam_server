import prisma from "@repo/db/index.js";




export class TargetExamService {





    async fetchTargetedExamById(id: string) {
        let target_exam = await prisma.targetExam.findFirst({
            where: {
                id: id,
            },
        });

        if (!target_exam) throw Error("Target exam not found");
        return target_exam;
    }

    async getAvailableTargetExam(category: string) {


        let response = await prisma.targetExam.findMany({
            where: {
                Category: {
                    name: category
                }
            },
            select: {
                name: true,
                shortCode: true,
                id: true,
            },
        });

        if (!(response.length > 0)) {
            throw new Error("Can not find any exam");
        }

        let availableExam = response.flat();
        return availableExam;
    }

    async createTargetedExam(data: any) {
        let categoryData = await prisma.category.findFirst({
            where: {
                name: data.category,
            },
        });

        if (!categoryData) throw Error("category not found ");

        let { category, ...rest } = data;
        let target_exam = await prisma.targetExam.create({
            data: {
                ...rest,
                ...(categoryData && { Category: { connect: { id: categoryData.id } } }),
            },
        });

        return target_exam;
    }

    async getAvailableTargetExamAll() {
        let response = await prisma.targetExam.findMany({
            select: {
                name: true,
                shortCode: true,
                id: true,
            },
        });

        if (!(response.length > 0)) {
            throw new Error("Can not find any exam");
        }

        let availableExam = response.flat();
        return availableExam;
    }





}
