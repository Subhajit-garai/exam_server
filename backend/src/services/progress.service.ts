import { CustomError } from "@/middleware/globalErrorHandler.js";
import prisma from "@repo/db/index.js";
import { ProgressStatus } from "@repo/prisma/client.js";
import { RedisProvider } from "@/lib/radisProvider.js";

export class ProgressService {

    // Track topic progress (Heartbeat)
    async trackTopicProgress(userId: string, topicName: string, timeSpentDelta: number) {
        // Find existing or create new

        let topicId = await prisma.topic.findUnique({
            where: {
                name: topicName
            }
        });

        if (!topicId) throw new CustomError("invalid topic name")

        const existing = await prisma.userTopicProgress.findUnique({
            where: {
                userId_topicId: {
                    userId,
                    topicId: topicId.id
                }
            }
        });

        const newTimeSpent = (existing?.timeSpent || 0) + timeSpentDelta;
        let status: ProgressStatus = existing?.status || "IN_PROGRESS";



        // Track in Redis for Daily Trend
        const redis = RedisProvider.getInstance().getclient();
        const todayStr = new Date().toISOString().split('T')[0];
        const redisKey = `user:${userId}:study:time:${todayStr}`;

        await redis.incrby(redisKey, timeSpentDelta);
        await redis.expire(redisKey, 86400 * 3); // Keep for 3 days

        return await prisma.userTopicProgress.upsert({
            where: {
                userId_topicId: {
                    userId,
                    topicId: topicId.id
                }
            },
            update: {
                timeSpent: { increment: timeSpentDelta },
                lastReadAt: new Date(),
                status: status !== "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"
            },
            create: {
                userId,
                topicId: topicId.id,
                timeSpent: timeSpentDelta,
                status: "IN_PROGRESS",
                lastReadAt: new Date()
            }
        });
    }

    // Mark topic as completed manually
    async updateTopicStatus(userId: string, topicName: string, status: ProgressStatus) {


        let topicId = await prisma.topic.findUnique({
            where: {
                name: topicName
            }
        });

        if (!topicId) throw new CustomError("invalid topic name")
        return await prisma.userTopicProgress.update({
            where: {
                userId_topicId: {
                    userId,
                    topicId: topicId.id
                }
            },
            data: {
                status,
                lastReadAt: new Date()
            }
        });
    }

    // Get aggregated syllabus progress
    // Calculates percentage of topics completed vs total topics in the exam year
    async getSyllabusProgress(userId: string, examYearId: string) {
        // 1. Get all subjects for this exam year (via Syllabus)
        // Assuming strict mapping: ExamYear -> Syllabus -> SubjectSyllabusMap -> Subject -> Topic
        // This query might be complex depending on schema. 
        // derived path: Syllabus(type=EXAM, exam_year_id) -> SubjectSyllabusMap -> TopicSubjectMap -> Topic

        // Simplified approach: Get all topics that belong to subjects in this exam year's syllabus

        // Fetch Syllabus for the Exam Year
        const syllabus = await prisma.syllabus.findFirst({
            where: { exam_year_id: examYearId, type: "EXAM" },
            include: {
                SubjectSyllabusMap: {
                    include: {
                        subject: {
                            include: {
                                topics: {
                                    select: { id: true, name: true, subjectId: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!syllabus) return { totalProgress: 0, subjects: [] };

        const allSubjects = syllabus.SubjectSyllabusMap.map(map => map.subject);
        const subjectStats = [];
        let totalTopicsGlobal = 0;
        let completedTopicsGlobal = 0;

        for (const subject of allSubjects) {
            const topicIds = subject.topics.map(t => t.id);
            const totalTopics = topicIds.length;

            if (totalTopics === 0) {
                subjectStats.push({
                    subjectId: subject.id,
                    name: subject.name,
                    progress: 0,
                    totalTopics: 0,
                    completedTopics: 0
                });
                continue;
            }

            // Count completed topics for this user in this subject
            const completedCount = await prisma.userTopicProgress.count({
                where: {
                    userId,
                    topicId: { in: topicIds },
                    status: "COMPLETED"
                }
            });

            // Calculate progress %
            const progress = (completedCount / totalTopics) * 100;

            subjectStats.push({
                subjectId: subject.id,
                name: subject.name,
                progress: parseFloat(progress.toFixed(2)),
                totalTopics,
                completedTopics: completedCount
            });

            totalTopicsGlobal += totalTopics;
            completedTopicsGlobal += completedCount;
        }

        const totalProgress = totalTopicsGlobal > 0
            ? (completedTopicsGlobal / totalTopicsGlobal) * 100
            : 0;

        return {
            totalProgress: parseFloat(totalProgress.toFixed(2)),
            subjects: subjectStats
        };
    }

    // --- Individual Dashboard/Stats Methods ---

    // 1. Get Study Hours (with Trend)
    async getStudyHours(userId: string) {
        // Daily Trend via Redis
        const redis = RedisProvider.getInstance().getclient();
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        const [todaySecondsStr, yesterdaySecondsStr] = await Promise.all([
            redis.get(`user:${userId}:study:time:${todayStr}`),
            redis.get(`user:${userId}:study:time:${yesterdayStr}`)
        ]);

        const todayHours = parseFloat(((parseInt(todaySecondsStr || "0") / 3600)).toFixed(1));
        const yesterdayHours = parseFloat(((parseInt(yesterdaySecondsStr || "0") / 3600)).toFixed(1));

        // Global Hours (from DB)
        const progressAggregate = await prisma.userTopicProgress.aggregate({
            where: { userId },
            _sum: { timeSpent: true }
        });
        const totalSeconds = progressAggregate._sum.timeSpent || 0;
        const studyHours = Math.round(totalSeconds / 3600);

        return {
            hours: `${studyHours}h`,
            trend: {
                today: todayHours,
                yesterday: yesterdayHours,
                increase: todayHours >= yesterdayHours
            }
        };
    }

    // Helper to get Exam Progress
    private async _getExamProgress(userId: string) {
        return await prisma.examProgress.findUnique({
            where: { userId }
        });
    }

    // Helper to get Daily Trend Generic
    private async _getDailyTrend(userId: string, metric: 'count' | 'score' | 'correct' | 'total_q') {
        const redis = RedisProvider.getInstance().getclient();
        const todayStr = new Date().toISOString().split('T')[0];
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

        const [todayVal, yesterdayVal] = await Promise.all([
            redis.get(`user:${userId}:tests:${metric}:${todayStr}`),
            redis.get(`user:${userId}:tests:${metric}:${yesterdayStr}`)
        ]);
        return {
            today: parseFloat(todayVal || "0"),
            yesterday: parseFloat(yesterdayVal || "0")
        };
    }

    // 2. Tests Attempted
    async getTestsAttempted(userId: string) {
        const examProgress = await this._getExamProgress(userId);
        const testsAttempted = examProgress?.attended || 0;

        // Trend
        const { today, yesterday } = await this._getDailyTrend(userId, 'count');

        return {
            testsAttempted,
            trend: {
                today,
                yesterday,
                increase: today >= yesterday
            }
        };
    }

    // 3. Average Score
    async getAverageScore(userId: string) {
        const examProgress = await this._getExamProgress(userId);
        const avgScore = examProgress?.accuracy || 0; // Keeping original proxy logic for global

        // Daily Avg Score Calculation
        const scoreTrend = await this._getDailyTrend(userId, 'score');
        const countTrend = await this._getDailyTrend(userId, 'count');

        const todayAvg = countTrend.today > 0 ? (scoreTrend.today / countTrend.today) : 0;
        const yesterdayAvg = countTrend.yesterday > 0 ? (scoreTrend.yesterday / countTrend.yesterday) : 0;

        return {
            avgScore: `${Math.round(avgScore)}%`,
            trend: {
                today: parseFloat(todayAvg.toFixed(1)),
                yesterday: parseFloat(yesterdayAvg.toFixed(1)),
                increase: todayAvg >= yesterdayAvg
            }
        };
    }

    // 4. Accuracy
    async getAccuracy(userId: string) {
        const examProgress = await this._getExamProgress(userId);
        const accuracy = examProgress?.accuracy || 0;

        // Daily Accuracy Calculation
        const correctTrend = await this._getDailyTrend(userId, 'correct');
        const totalQTrend = await this._getDailyTrend(userId, 'total_q');

        const todayAcc = totalQTrend.today > 0 ? (correctTrend.today / totalQTrend.today) * 100 : 0;
        const yesterdayAcc = totalQTrend.yesterday > 0 ? (correctTrend.yesterday / totalQTrend.yesterday) * 100 : 0;

        return {
            accuracy: `${Math.round(accuracy)}%`,
            trend: {
                today: parseFloat(todayAcc.toFixed(1)),
                yesterday: parseFloat(yesterdayAcc.toFixed(1)),
                increase: todayAcc >= yesterdayAcc
            }
        };
    }

    // Combined (Optional, if still needed, can compose)
    async getDashboardStats(userId: string) {
        const [study, tests, score, acc] = await Promise.all([
            this.getStudyHours(userId),
            this.getTestsAttempted(userId),
            this.getAverageScore(userId),
            this.getAccuracy(userId)
        ]);

        return {
            studyHours: study.hours,
            stats: {
                studyHours: study,
                testsAttempted: tests,
                avgScore: score,
                accuracy: acc
            }
        };
    }

    // 5. Update Exam Progress (General)
    async updateExamProgress(userId: string, examId: string) {
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
    async getUserTopicsProgress(userId: string) {

        const progressList = await prisma.userTopicProgress.findMany({
            where: {
                userId: userId
            },
            include: {
                topic: {
                    select: {
                        name: true,
                        estimatedReadTime: true
                    }
                }
            }
        })

        return progressList.map(progress => {
            const estimatedMinutes = progress.topic.estimatedReadTime || 10;
            const estimatedSeconds = estimatedMinutes * 60;
            const percentage = Math.min(
                (progress.timeSpent / estimatedSeconds) * 100,
                100
            );

            return {
                topicId: progress.topicId,
                topicName: progress.topic.name,
                percentage: Math.round(percentage),
                timeSpent: progress.timeSpent,
                status: progress.status
            };
        });
    }
}
