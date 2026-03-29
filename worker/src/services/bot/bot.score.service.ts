import prisma from "@repo/db/index.js";

export class BotScoreService {
    /**
     * Updates user progress based on the exam type.
     */
    async updateUserProgress(userId: string, examId: string) {
        // 1. Fetch Exam Logic
        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            select: { examtype: true }
        });

        if (!exam) return;

        // 2. Fetch Score to calculate correctness
        const scoreEntry = await prisma.score.findFirst({
            where: { exam_id: examId, user_id: userId },
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

        // 3. Update Specific Progress

        switch (exam.examtype) {
            case "Dpp": {
                await prisma.dppProgress.upsert({
                    where: { userId: userId },
                    update: {
                        solvedCount: { increment: 1 },
                        questionsSolved: { increment: right },
                        lastDppId: examId,
                        lastDppDate: new Date()
                    },
                    create: {
                        userId: userId,
                        solvedCount: 1,
                        questionsSolved: right,
                        lastDppId: examId,
                        lastDppDate: new Date()
                    }
                });
            }
                break;
            case "Quiz": {
                await prisma.quizProgress.upsert({
                    where: { userId: userId },
                    update: {
                        attended: { increment: 1 },
                        totalScore: { increment: right * 4 }, // Assuming 4 marks
                        lastQuizId: examId,
                        lastQuizDate: new Date()
                    },
                    create: {
                        userId: userId,
                        attended: 1,
                        totalScore: right * 4,
                        lastQuizId: examId,
                        lastQuizDate: new Date()
                    }
                });

            }

                break;

            default: {
                const updatedProgress = await prisma.examProgress.upsert({
                    where: { userId: userId },
                    update: {
                        attended: { increment: 1 },
                        totalCorrect: { increment: right },
                        totalQuestionsAttempted: { increment: totalAttemptedInThisExam },
                        lastExamId: examId,
                        lastExamDate: new Date()
                    },
                    create: {
                        userId: userId,
                        attended: 1,
                        totalCorrect: right,
                        totalQuestionsAttempted: totalAttemptedInThisExam,
                        lastExamId: examId,
                        lastExamDate: new Date()
                    }
                });

                // Recalculate accuracy
                if (updatedProgress.totalQuestionsAttempted > 0) {
                    const newAccuracy = Math.floor((updatedProgress.totalCorrect / updatedProgress.totalQuestionsAttempted) * 100);
                    await prisma.examProgress.upsert({
                        where: { userId: userId },
                        update: { accuracy: newAccuracy },
                        create: {
                            accuracy: newAccuracy,
                            userId: userId,
                            attended: 1,
                            totalCorrect: right,
                            totalQuestionsAttempted: totalAttemptedInThisExam,
                            lastExamId: examId,
                            lastExamDate: new Date()
                        }
                    });
                }
            }
                break;
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
