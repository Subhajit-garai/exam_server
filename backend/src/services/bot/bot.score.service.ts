import prisma from "@repo/db/index.js";
import { ExamType } from "@repo/prisma/enums.js";

export class BotScoreService {
    /**
     * Updates user progress based on the exam type.
     */
    async updateUserProgress(userid: string, lastExamid: string, examType: ExamType) {

        // 1. Fetch score to calculate accuracy
        const scoreEntry = await prisma.score.findFirst({
            where: { exam_id: lastExamid, user_id: userid },
            select: { result: true }
        });

        let right = 0;
        let wrong = 0;
        if (scoreEntry?.result) {
            const result = scoreEntry.result as any;
            Object.keys(result).forEach((key) => {
                right += result[key].Right || 0;
                wrong += result[key].Wrong || 0;
            });
        }
        const totalAttemptedInThisExam = right + wrong;

        // 2. Update Progress
        if (examType === "Test" || examType === "Mock" || examType === "PYQ") {
            const updatedProgress = await prisma.examProgress.update({
                where: { userId: userid },
                data: {
                    lastExamId: lastExamid,
                    lastExamDate: new Date(),
                    attended: { increment: 1 },
                    totalCorrect: { increment: right },
                    totalQuestionsAttempted: { increment: totalAttemptedInThisExam }
                },
            });

            // Recalculate accuracy
            if (updatedProgress.totalQuestionsAttempted > 0) {
                const newAccuracy = (updatedProgress.totalCorrect / updatedProgress.totalQuestionsAttempted) * 100;
                await prisma.examProgress.update({
                    where: { userId: userid },
                    data: { accuracy: newAccuracy }
                });
            }

        } else if (examType === "Dpp") {
            await prisma.dppProgress.update({
                where: { userId: userid },
                data: {
                    lastDppId: lastExamid,
                    lastDppDate: new Date(),
                    solvedCount: { increment: 1 },
                    questionsSolved: { increment: right }
                },
            });
        } else if (examType === "Quiz") {
            await prisma.quizProgress.update({
                where: { userId: userid },
                data: {
                    lastQuizId: lastExamid,
                    lastQuizDate: new Date(),
                    attended: { increment: 1 },
                    totalScore: { increment: right * 4 } // Assuming 4 marks
                },
            });
        } else if (examType === "Contest") {
            const updatedProgress = await prisma.examProgress.update({
                where: { userId: userid },
                data: {
                    lastExamId: lastExamid,
                    lastExamDate: new Date(),
                    attended: { increment: 1 },
                    totalCorrect: { increment: right },
                    totalQuestionsAttempted: { increment: totalAttemptedInThisExam }
                },
            });
            if (updatedProgress.totalQuestionsAttempted > 0) {
                const newAccuracy = (updatedProgress.totalCorrect / updatedProgress.totalQuestionsAttempted) * 100;
                await prisma.examProgress.update({
                    where: { userId: userid },
                    data: { accuracy: newAccuracy }
                });
            }
        }
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
