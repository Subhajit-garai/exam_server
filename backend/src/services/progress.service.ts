import prisma from "@repo/db/index.js";
import { ProgressStatus } from "@repo/prisma/client.js";

export class ProgressService {

    // Track topic progress (Heartbeat)
    async trackTopicProgress(userId: string, topicId: string, timeSpentDelta: number) {
        // Find existing or create new
        const existing = await prisma.userTopicProgress.findUnique({
            where: {
                userId_topicId: {
                    userId,
                    topicId
                }
            }
        });

        const newTimeSpent = (existing?.timeSpent || 0) + timeSpentDelta;
        let status: ProgressStatus = existing?.status || "IN_PROGRESS";

        // Auto-complete logic example (optional threshold, e.g. 5 mins)
        // if (newTimeSpent > 300 && status === "NOT_STARTED") status = "IN_PROGRESS";

        return await prisma.userTopicProgress.upsert({
            where: {
                userId_topicId: {
                    userId,
                    topicId
                }
            },
            update: {
                timeSpent: { increment: timeSpentDelta },
                lastReadAt: new Date(),
                status: status !== "COMPLETED" ? "IN_PROGRESS" : "COMPLETED"
            },
            create: {
                userId,
                topicId,
                timeSpent: timeSpentDelta,
                status: "IN_PROGRESS",
                lastReadAt: new Date()
            }
        });
    }

    // Mark topic as completed manually
    async updateTopicStatus(userId: string, topicId: string, status: ProgressStatus) {
        return await prisma.userTopicProgress.update({
            where: {
                userId_topicId: {
                    userId,
                    topicId
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
}
