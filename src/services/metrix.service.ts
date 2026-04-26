import dayjs from "dayjs";
import { db } from "@repo/db/index.js";
import { scores as ScoreTable, leaderboards as LeaderboardTable } from "@repo/db/schema/score.js";
import { exam_progress, dpp_progress, quiz_progress } from "@repo/db/schema/progress.js";
import { users } from "@repo/db/schema/user.js";
import { eq, and, ne, desc, sql } from "drizzle-orm";

type Leaderboard = {
    user_id: string;
    name: string;
    score: number;
    rank: number;
}
type score = {
    time: string;
    total_score: number;
}
type subjectScore = {
    time: string;
    subject: string;
    total_right: number;
    total_wrong: number;
}
type TimeGroup = "hour" | "day" | "week" | "month";

export class MetrixService {

    async examQuestionAttemp(userId: string, examId: string) {
        const [data] = await db.select({
            not_attempt: ScoreTable.not_attempt,
            total_questions: ScoreTable.total_questions,
        })
            .from(ScoreTable)
            .where(and(
                eq(ScoreTable.user_id, userId),
                eq(ScoreTable.exam_id, examId)
            ));
        return data;
    }

    async WeekNessGraphOfAnExam(userId: string, examId: string) {
        let range = 10;
        const [data] = await db.select({
            topic_wise_result: ScoreTable.topic_wise_result,
        })
            .from(ScoreTable)
            .where(and(
                eq(ScoreTable.user_id, userId),
                eq(ScoreTable.exam_id, examId)
            ));

        type item = {
            [key: string]: {
                Right: number;
                Wrong: number;
            };
        };

        let sanitizedFn = (items: item) => {
            if (!items) return;
            let arr: any[] = [];
            Object.keys(items).forEach((item) => {
                let eleA = items[item].Right;
                let eleB = items[item].Wrong;
                if (eleA > range || eleB > range) {
                    range = range + 10;
                }
                arr.push({
                    subject: item as string,
                    A: eleA,
                    B: eleB,
                    fullMark: eleA + eleB,
                });
            });
            return arr;
        };
        let sanitizedData = sanitizedFn(data?.topic_wise_result as item);
        return { sanitizedData, range };
    }

    async getUserALLExamsRankData(userId: string, offset: number = 10) {
        return await db.select({
            exam_id: LeaderboardTable.exam_id,
            score: LeaderboardTable.score,
            rank: LeaderboardTable.rank,
        })
            .from(LeaderboardTable)
            .where(eq(LeaderboardTable.user_id, userId))
            .orderBy(desc(LeaderboardTable.time))
            .limit(offset);
    }

    async getAllUserRankFronAnExam(userId: string, examId: string) {
        const data = await db.select({
            score: LeaderboardTable.score,
            rank: LeaderboardTable.rank,
        })
            .from(LeaderboardTable)
            .where(and(
                eq(LeaderboardTable.exam_id, examId),
                ne(LeaderboardTable.user_id, userId)
            ));

        const [myRank] = await db.select({
            score: LeaderboardTable.score,
            rank: LeaderboardTable.rank,
        })
            .from(LeaderboardTable)
            .where(and(
                eq(LeaderboardTable.exam_id, examId),
                eq(LeaderboardTable.user_id, userId)
            ));

        return { data, myRank };
    }

    async getExamRank(userId: string, examId: string) {
        const [Rank] = await db.select({
            score: LeaderboardTable.score,
            rank: LeaderboardTable.rank,
        })
            .from(LeaderboardTable)
            .where(and(
                eq(LeaderboardTable.exam_id, examId),
                eq(LeaderboardTable.user_id, userId)
            ));
        return Rank;
    }

    async getperformance(userId: string) {
        const [exam] = await db.select().from(exam_progress).where(eq(exam_progress.user_id, userId));
        const [dpp] = await db.select().from(dpp_progress).where(eq(dpp_progress.user_id, userId));
        const [quiz] = await db.select().from(quiz_progress).where(eq(quiz_progress.user_id, userId));

        const examData = exam || { attended: 0, accuracy: 0, last_rank: 0 } as any;
        const dppData = dpp || { solved_count: 0, questions_solved: 0 } as any;
        const quizData = quiz || { attended: 0, total_score: 0 } as any;

        return {
            exam: {
                attended: examData.attended,
                accuracy: examData.accuracy,
                lastRank: examData.last_rank
            },
            dpp: {
                solvedCount: dppData.solved_count,
                questionsSolved: dppData.questions_solved
            },
            quiz: {
                attended: quizData.attended,
                totalScore: quizData.total_score
            },
            totalAttended: (examData.attended || 0) + (quizData.attended || 0),
        };
    }

    async getTopNOfAnExam(userId: string, examId: string, offset: string = "4") {
        return await this.get_user_leaderboard(examId, userId, parseInt(offset));
    }

    async get_user_leaderboard(examId: string, userId: string, topLimit: number = 4): Promise<Leaderboard[]> {
        const query = sql`
            WITH top_n AS (
                SELECT l.user_id, u.name, l.score, l.rank
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.exam_id = ${examId}
                ORDER BY l.rank ASC
                LIMIT ${topLimit}
            ),
            my_rank AS (
                SELECT l.user_id, u.name, l.score, l.rank
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.exam_id = ${examId}
                AND l.user_id = ${userId}
            ),
            extra_user AS (
                SELECT l.user_id, u.name, l.score, l.rank
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.exam_id = ${examId}
                AND l.rank > (SELECT MAX(rank) FROM top_n)
                ORDER BY l.rank ASC
                LIMIT 1
            )
            SELECT * FROM top_n
            UNION ALL
            SELECT * FROM my_rank
            WHERE user_id NOT IN (SELECT user_id FROM top_n)
            UNION ALL
            SELECT * FROM extra_user
            WHERE ${userId} IN (SELECT user_id FROM top_n);
        `;

        const result = await db.execute(query);
        return result.rows as unknown as Leaderboard[];
    }

    async get_user_score(userId: string, interval: string, group: TimeGroup = "hour") {
        const config = {
            hour: { table: "user_score_summary_hour", column: "hour" },
            day: { table: "user_score_summary_day", column: "day" },
            week: { table: "user_score_summary_week", column: "week" },
            month: { table: "user_score_summary_month", column: "month" },
        }[group];

        const query = sql.raw(`
            SELECT
                ${config.column} as time,
                total_score
            FROM
                ${config.table}
            WHERE
                user_id = '${userId}'
                AND ${config.column} >= NOW() - '${interval}'::INTERVAL
            ORDER BY
                ${config.column} ASC
        `);

        const result = await db.execute(query);
        return result.rows as unknown as any[];
    }

    async getScoreMetrix(userid: string, offset: string, startDate?: string, endDate?: string) {
        let interval = "7 DAYS";
        let data = await this.get_user_score(userid, interval, "week");

        const sanitizedData = data.map((item: any) => {
            return {
                ...item,
                total_score: parseInt(item.total_score),
            };
        });

        const maxScore = sanitizedData.reduce(
            (max, item) => Math.max(max, item.total_score),
            -Infinity
        );

        let finaldata = sanitizedData.map((item: any) => {
            let time = dayjs(item[offset] || item.time);
            let key = time.format("DD-MMM-YYYY");
            switch (offset) {
                case "week":
                    key = time.format("DD-MMM");
                    break;
                case "month":
                    key = time.format("MMM-YY");
                    break;
                case "hour":
                    key = time.format("ddd-MMM:hh A");
                    break;
                case "minute":
                    key = time.format("ddd:hh:mm A");
                    break;
                default:
                    break;
            }

            return {
                key: key,
                score: item.total_score,
            };
        });

        return { finaldata, maxScore };
    }

    async get_subject_wish_score(userId: string, interval: string, group: TimeGroup = "hour") {
        const config = {
            hour: { table: "subject_score_summary_hour", column: "hour" },
            day: { table: "subject_score_summary_day", column: "day" },
            week: { table: "subject_score_summary_week", column: "week" },
            month: { table: "subject_score_summary_month", column: "month" },
        }[group];

        const query = sql.raw(`
            SELECT
                ${config.column} as time,
                subject,
                total_right,
                total_wrong
            FROM
                ${config.table}
            WHERE
                user_id = '${userId}'
                AND ${config.column} >= NOW() - '${interval}'::INTERVAL
            ORDER BY
                ${config.column} ASC,
                user_id
        `);

        const result = await db.execute(query);
        return result.rows as unknown as any[];
    }

    async getSubjectScoreMetrix(userid: string, offset: string, startDate?: string, endDate?: string) {
        let interval = "7 DAYS";
        let data = await this.get_subject_wish_score(userid, interval);
        let range = 10;

        interface Data {
            subject: string;
            A: number;
            B: number;
            fullMark: number;
        }

        const avgBySubject = (data: Data[]): Data[] => {
            const grouped = data.reduce((acc, item) => {
                if (!acc[item.subject]) {
                    acc[item.subject] = { ...item, count: 1 };
                } else {
                    acc[item.subject].A += item.A;
                    acc[item.subject].B += item.B;
                    acc[item.subject].count += 1;
                }
                return acc;
            }, {} as { [key: string]: Data & { count: number } });

            return Object.keys(grouped).map((subject) => {
                const item = grouped[subject];
                return {
                    subject: item.subject,
                    A: item.A / item.count,
                    B: item.B / item.count,
                    fullMark: item.fullMark,
                };
            });
        };

        let sanitizedData = data.map((item: any) => {
            let eleA = parseInt(item.total_right);
            let eleB = parseInt(item.total_wrong);
            if (eleA > range || eleB > range) {
                range = range + 10;
            }
            return {
                subject: item.subject as string,
                A: eleA,
                B: eleB,
                fullMark: eleA + eleB,
            };
        });

        const finaldata = avgBySubject(sanitizedData);
        return { finaldata, range };
    }
}

