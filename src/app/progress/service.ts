import { CustomError } from "@/middleware/globalErrorHandler.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { db } from "@/db/index.js";
import { topics, subjects } from "@/db/schema/note.js";
import {
  user_topic_progress,
  exam_progress,
  dpp_progress,
  quiz_progress,
} from "@/db/schema/progress.js";
import { syllabuses, subject_syllabus_maps } from "@/db/schema/syllabus.js";
import { exams } from "@/db/schema/exam.js";
import { scores } from "@/db/schema/score.js";
import {
  eq,
  and,
  inArray,
  sum,
  count as drizzleCount,
  desc as drizzleDesc,
} from "drizzle-orm";

export class ProgressService {
  async trackTopicProgress(
    userId: string,
    topicName: string,
    timeSpentDelta: number,
  ) {
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.name, topicName))
      .limit(1);

    if (!topic) throw new CustomError("invalid topic name");

    const [existing] = await db
      .select()
      .from(user_topic_progress)
      .where(
        and(
          eq(user_topic_progress.user_id, userId),
          eq(user_topic_progress.topic_id, topic.id),
        ),
      )
      .limit(1);

    const newTimeSpent = (existing?.time_spent || 0) + timeSpentDelta;
    let status: any = existing?.status || "IN_PROGRESS";

    const redis = RedisManager.getInstance().getclient();
    const todayStr = new Date().toISOString().split("T")[0];
    const redisKey = `user:${userId}:study:time:${todayStr}`;

    await redis.incrby(redisKey, timeSpentDelta);
    await redis.expire(redisKey, 86400 * 3); // Keep for 3 days

    if (existing) {
      const [updated] = await db
        .update(user_topic_progress)
        .set({
          time_spent: newTimeSpent,
          last_read_at: new Date(),
          status: status !== "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
        })
        .where(eq(user_topic_progress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(user_topic_progress)
        .values({
          user_id: userId,
          topic_id: topic.id,
          time_spent: timeSpentDelta,
          status: "IN_PROGRESS",
          last_read_at: new Date(),
        })
        .returning();
      return created;
    }
  }

  async updateTopicStatus(userId: string, topicName: string, status: any) {
    const [topic] = await db
      .select()
      .from(topics)
      .where(eq(topics.name, topicName))
      .limit(1);

    if (!topic) throw new CustomError("invalid topic name");

    const [updated] = await db
      .update(user_topic_progress)
      .set({
        status,
        last_read_at: new Date(),
      })
      .where(
        and(
          eq(user_topic_progress.user_id, userId),
          eq(user_topic_progress.topic_id, topic.id),
        ),
      )
      .returning();

    return updated;
  }

  async getSyllabusProgress(userId: string, examYearId: string) {
    const [syllabusData] = await db
      .select()
      .from(syllabuses)
      .where(
        and(
          eq(syllabuses.exam_year_id, examYearId),
          eq(syllabuses.type, "EXAM"),
        ),
      )
      .limit(1);

    if (!syllabusData) return { totalProgress: 0, subjects: [] };

    const subjectMaps = await db
      .select()
      .from(subject_syllabus_maps)
      .where(eq(subject_syllabus_maps.syllabus_id, syllabusData.id));

    const subjectMapsWithDetails = await Promise.all(
      subjectMaps.map(async (sm) => {
        const [subject] = await db
          .select()
          .from(subjects)
          .where(eq(subjects.id, sm.subject_id))
          .limit(1);
        if (!subject) return null;
        const topicList = await db
          .select({
            id: topics.id,
            name: topics.name,
            subjectId: topics.subject_id,
          })
          .from(topics)
          .where(eq(topics.subject_id, subject.id));
        return { ...sm, subject: { ...subject, topics: topicList } };
      }),
    );

    const syllabus = {
      ...syllabusData,
      subjectMaps: subjectMapsWithDetails.filter(Boolean),
    };

    if (!syllabus) return { totalProgress: 0, subjects: [] };

    const allSubjects = (syllabus.subjectMaps as any).map(
      (map: any) => map.subject,
    );

    const subjectStats = [];
    let totalTopicsGlobal = 0;
    let completedTopicsGlobal = 0;

    for (const subject of allSubjects) {
      const topicIds = subject.topics.map((t: any) => t.id);
      const totalTopics = topicIds.length;

      if (totalTopics === 0) {
        subjectStats.push({
          subjectId: subject.id,
          name: subject.name,
          progress: 0,
          totalTopics: 0,
          completedTopics: 0,
        });
        continue;
      }

      const completedCountResult = await db
        .select({ value: drizzleCount() })
        .from(user_topic_progress)
        .where(
          and(
            eq(user_topic_progress.user_id, userId),
            inArray(user_topic_progress.topic_id, topicIds),
            eq(user_topic_progress.status, "COMPLETED"),
          ),
        );
      const completedCount = completedCountResult[0].value;

      const progress = (completedCount / totalTopics) * 100;

      subjectStats.push({
        subjectId: subject.id,
        name: subject.name,
        progress: parseFloat(progress.toFixed(2)),
        totalTopics,
        completedTopics: completedCount,
      });

      totalTopicsGlobal += totalTopics;
      completedTopicsGlobal += completedCount;
    }

    const totalProgress =
      totalTopicsGlobal > 0
        ? (completedTopicsGlobal / totalTopicsGlobal) * 100
        : 0;

    return {
      totalProgress: parseFloat(totalProgress.toFixed(2)),
      subjects: subjectStats,
    };
  }

  async getStudyHours(userId: string) {
    const redis = RedisManager.getInstance().getclient();
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    const [todaySecondsStr, yesterdaySecondsStr] = await Promise.all([
      redis.get(`user:${userId}:study:time:${todayStr}`),
      redis.get(`user:${userId}:study:time:${yesterdayStr}`),
    ]);

    const todayHours = parseFloat(
      (parseInt(todaySecondsStr || "0") / 3600).toFixed(1),
    );
    const yesterdayHours = parseFloat(
      (parseInt(yesterdaySecondsStr || "0") / 3600).toFixed(1),
    );

    const progressAggregate = await db
      .select({ value: sum(user_topic_progress.time_spent) })
      .from(user_topic_progress)
      .where(eq(user_topic_progress.user_id, userId));
    const totalSeconds = parseInt(progressAggregate[0].value || "0");
    const studyHours = Math.round(totalSeconds / 3600);

    return {
      hours: `${studyHours}h`,
      trend: {
        today: todayHours,
        yesterday: yesterdayHours,
        increase: todayHours >= yesterdayHours,
      },
    };
  }

  private async _getExamProgress(userId: string) {
    const [progress] = await db
      .select()
      .from(exam_progress)
      .where(eq(exam_progress.user_id, userId))
      .limit(1);
    return progress;
  }

  private async _getDailyTrend(
    userId: string,
    metric: "count" | "score" | "correct" | "total_q",
  ) {
    const redis = RedisManager.getInstance().getclient();
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

    const [todayVal, yesterdayVal] = await Promise.all([
      redis.get(`user:${userId}:tests:${metric}:${todayStr}`),
      redis.get(`user:${userId}:tests:${metric}:${yesterdayStr}`),
    ]);
    return {
      today: parseFloat(todayVal || "0"),
      yesterday: parseFloat(yesterdayVal || "0"),
    };
  }

  async getTestsAttempted(userId: string) {
    const examProgress = await this._getExamProgress(userId);
    const testsAttempted = examProgress?.attended || 0;

    const { today, yesterday } = await this._getDailyTrend(userId, "count");

    return {
      testsAttempted,
      trend: {
        today,
        yesterday,
        increase: today >= yesterday,
      },
    };
  }

  async getAverageScore(userId: string) {
    const examProgress = await this._getExamProgress(userId);
    const avgScore = examProgress?.accuracy || 0;

    const scoreTrend = await this._getDailyTrend(userId, "score");
    const countTrend = await this._getDailyTrend(userId, "count");

    const todayAvg =
      countTrend.today > 0 ? scoreTrend.today / countTrend.today : 0;
    const yesterdayAvg =
      countTrend.yesterday > 0
        ? scoreTrend.yesterday / countTrend.yesterday
        : 0;

    return {
      avgScore: `${Math.round(avgScore)}%`,
      trend: {
        today: parseFloat(todayAvg.toFixed(1)),
        yesterday: parseFloat(yesterdayAvg.toFixed(1)),
        increase: todayAvg >= yesterdayAvg,
      },
    };
  }

  async getAccuracy(userId: string) {
    const examProgress = await this._getExamProgress(userId);
    const accuracy = examProgress?.accuracy || 0;

    const correctTrend = await this._getDailyTrend(userId, "correct");
    const totalQTrend = await this._getDailyTrend(userId, "total_q");

    const todayAcc =
      totalQTrend.today > 0
        ? (correctTrend.today / totalQTrend.today) * 100
        : 0;
    const yesterdayAcc =
      totalQTrend.yesterday > 0
        ? (correctTrend.yesterday / totalQTrend.yesterday) * 100
        : 0;

    return {
      accuracy: `${Math.round(accuracy)}%`,
      trend: {
        today: parseFloat(todayAcc.toFixed(1)),
        yesterday: parseFloat(yesterdayAcc.toFixed(1)),
        increase: todayAcc >= yesterdayAcc,
      },
    };
  }

  async getDashboardStats(userId: string) {
    const [study, tests, score, acc] = await Promise.all([
      this.getStudyHours(userId),
      this.getTestsAttempted(userId),
      this.getAverageScore(userId),
      this.getAccuracy(userId),
    ]);

    return {
      studyHours: study.hours,
      stats: {
        studyHours: study,
        testsAttempted: tests,
        avgScore: score,
        accuracy: acc,
      },
    };
  }

  async updateUserProgressAfterExam(
    userId: string,
    examId: string,
    evaluationResult?: any,
  ) {
    await this.updateExamProgress(userId, examId);
  }

  async updateExamProgress(userId: string, examId: string) {
    const [exam] = await db
      .select({ examtype: exams.exam_type })
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam) return;

    const [scoreEntry] = await db
      .select({ result: scores.result })
      .from(scores)
      .where(and(eq(scores.exam_id, examId), eq(scores.user_id, userId)))
      .limit(1);

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

    switch (exam.examtype) {
      case "Dpp":
        {
          const [existing] = await db
            .select()
            .from(dpp_progress)
            .where(eq(dpp_progress.user_id, userId))
            .limit(1);
          if (existing) {
            await db
              .update(dpp_progress)
              .set({
                solved_count: (existing.solved_count || 0) + 1,
                questions_solved: (existing.questions_solved || 0) + right,
                last_dpp_id: examId,
                last_dpp_date: new Date(),
              })
              .where(eq(dpp_progress.user_id, userId));
          } else {
            await db.insert(dpp_progress).values({
              user_id: userId,
              solved_count: 1,
              questions_solved: right,
              last_dpp_id: examId,
              last_dpp_date: new Date(),
              current_streak: 0,
            });
          }
        }
        break;
      case "Quiz":
        {
          const [existing] = await db
            .select()
            .from(quiz_progress)
            .where(eq(quiz_progress.user_id, userId))
            .limit(1);
          if (existing) {
            await db
              .update(quiz_progress)
              .set({
                attended: (existing.attended || 0) + 1,
                total_score: (existing.total_score || 0) + right * 4,
                last_quiz_id: examId,
                last_quiz_date: new Date(),
              })
              .where(eq(quiz_progress.user_id, userId));
          } else {
            await db.insert(quiz_progress).values({
              user_id: userId,
              attended: 1,
              total_score: right * 4,
              last_quiz_id: examId,
              last_quiz_date: new Date(),
            });
          }
        }
        break;

      default:
        {
          const [existing] = await db
            .select()
            .from(exam_progress)
            .where(eq(exam_progress.user_id, userId))
            .limit(1);
          let updatedProgress: any;
          if (existing) {
            const [updated] = await db
              .update(exam_progress)
              .set({
                attended: (existing.attended || 0) + 1,
                total_correct: (existing.total_correct || 0) + right,
                total_questions_attempted:
                  (existing.total_questions_attempted || 0) +
                  totalAttemptedInThisExam,
                last_exam_id: examId,
                last_exam_date: new Date(),
              })
              .where(eq(exam_progress.user_id, userId))
              .returning();
            updatedProgress = updated;
          } else {
            const [created] = await db
              .insert(exam_progress)
              .values({
                user_id: userId,
                attended: 1,
                total_correct: right,
                total_questions_attempted: totalAttemptedInThisExam,
                last_exam_id: examId,
                last_exam_date: new Date(),
                last_rank: 0,
                best_rank: 0,
                accuracy: 0,
              })
              .returning();
            updatedProgress = created;
          }

          if (updatedProgress.total_questions_attempted > 0) {
            const newAccuracy = Math.floor(
              (updatedProgress.total_correct /
                updatedProgress.total_questions_attempted) *
                100,
            );
            await db
              .update(exam_progress)
              .set({ accuracy: newAccuracy })
              .where(eq(exam_progress.user_id, userId));
          }
        }
        break;
    }
  }

  async getUserTopicsProgress(userId: string) {
    const progressList = await db
      .select({
        id: user_topic_progress.id,
        userId: user_topic_progress.user_id,
        topicId: user_topic_progress.topic_id,
        timeSpent: user_topic_progress.time_spent,
        status: user_topic_progress.status,
        topic: {
          name: topics.name,
          estimatedReadTime: topics.estimated_read_time,
        },
      })
      .from(user_topic_progress)
      .leftJoin(topics, eq(user_topic_progress.topic_id, topics.id))
      .where(eq(user_topic_progress.user_id, userId));

    return progressList.map((progress) => {
      const estimatedMinutes = (progress.topic as any).estimatedReadTime || 10;
      const estimatedSeconds = estimatedMinutes * 60;
      const percentage = Math.min(
        (progress.timeSpent / estimatedSeconds) * 100,
        100,
      );

      return {
        topicId: progress.topicId,
        topicName: (progress.topic as any).name,
        percentage: Math.round(percentage),
        timeSpent: progress.timeSpent,
        status: progress.status,
      };
    });
  }
}
