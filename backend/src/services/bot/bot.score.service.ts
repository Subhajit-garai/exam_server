import prisma from "@repo/db/index.js";
import { ExamType } from "@repo/prisma/enums.js";

export class BotScoreService {
    /**
     * Updates user progress based on the exam type.
     */
    async updateUserProgress(userid: string, lastExamid: string, examType: ExamType) {
        const fieldMap: Partial<Record<ExamType, string>> = {
            Test: "lastExamid",
            Quiz: "lastQuizid",
            Dpp: "lastDppid",
            Contest: "lastContestid",
            Mock: "lastMockid",
        };

        const fieldName = fieldMap[examType];
        if (!fieldName) {
            throw new Error(`Unknown or unsupported exam type: ${examType}`);
        }

        return await prisma.progress.update({
            where: { userid },
            data: {
                [fieldName]: lastExamid,
            },
        });
    }

    async setUserScore(examid: string, userid: string, scoreData: any) {
        const existingScore = await prisma.score.findFirst({
            where: { exam_id: examid, user_id: userid },
        });

        if (existingScore) throw new Error("User score already present");

        const score = await prisma.score.create({
            data: { ...scoreData },
        });

        if (!score) throw new Error("Error while adding user score");
        return score;
    }

    async getUserScore(examid: string, userid: string) {
        return await prisma.score.findFirst({
            where: { exam_id: examid, user_id: userid },
        });
    }

    async setUserAnswer(data: any) {
        const { userid, examid, questionid, shuffleMap, selectedOption } = data;

        const isAnsExist = await prisma.userAns.findFirst({
            where: { examId: examid, userId: userid, questionId: questionid },
        });

        if (isAnsExist) {
            return await prisma.userAns.update({
                where: {
                    examId_userId_questionId: {
                        examId: examid,
                        userId: userid,
                        questionId: questionid,
                    },
                },
                data: { selectedOption },
            });
        } else {
            return await prisma.userAns.create({
                data: {
                    selectedOption,
                    examId: examid,
                    userId: userid,
                    questionId: questionid,
                    shuffleMap,
                },
            });
        }
    }

    async getUserAnswer(userid: string, examid: string) {
        const userAns = await prisma.userAns.findFirst({
            where: { examId: examid, userId: userid },
        });
        if (!userAns) throw new Error("User ans not exists");
        return userAns;
    }
}
