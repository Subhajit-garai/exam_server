import prisma, { Prisma } from "@repo/db/index.js";


export class Exampattern {



    async createExamPatternV2(data: Prisma.Exam_patternCreateInput) {

        let response = await prisma.exam_pattern.create({
            data: {
                ...data
            },
        });

        if (!response) throw Error(" exam patten not created ");

        return response;
    }



}