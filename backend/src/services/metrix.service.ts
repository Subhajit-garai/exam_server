import prisma from "@repo/db/index.js";
import dayjs from "dayjs";
// import {
//     get_subject_wish_daily_score,
//     get_subject_wish_hour_score,
//     get_subject_wish_minute_score,
//     get_subject_wish_monthly_score,
//     get_subject_wish_weekly_score,
//     getdailyscore,
//     gethourscore,
//     getminutescore,
//     getmonthlyscore,
//     getweeklyscore,
//     top_4_user_from_exam_leaderboard,
//     top_10_user_from_exam_leaderboard,
// } from "@repo/prisma/sql.js";


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
        let data = await prisma.score.findFirst({
            where: {
                user_id: userId,
                exam_id: examId,
            },
            select: {
                not_attempt: true,
                total_questions: true,
            },
        });
        return data;
    }

    async WeekNessGraphOfAnExam(userId: string, examId: string) {
        let range = 10;
        let data = await prisma.score.findFirst({
            where: {
                user_id: userId,
                exam_id: examId,
            },
            select: {
                topic_wise_result: true,
            },
        });

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
        let data = await prisma.leaderboard.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                time: "desc",
            },
            select: {
                exam_id: true,
                score: true,
                rank: true,
            },
            take: offset,
        });
        return data;
    }
    async getAllUserRankFronAnExam(userId: string, examId: string) {
        let data = await prisma.leaderboard.findMany({
            where: {
                exam_id: examId,
                user_id: { not: userId },
            },
            select: {
                score: true,
                rank: true,
            },
        });
        let myRank = await prisma.leaderboard.findFirst({
            where: {
                exam_id: examId,
                user_id: userId,
            },
            select: {
                score: true,
                rank: true,
            },
        });

        return { data, myRank };
    }

    async getExamRank(userId: string, examId: string) {
        let Rank = await prisma.leaderboard.findFirst({
            where: {
                exam_id: examId,
                user_id: userId,
            },
            select: {
                score: true,
                rank: true,
            },
        });
        return Rank;
    }

    async getperformance(userId: string) {
        let exam = await prisma.examProgress.findUnique({
            where: { userId: userId },
        });
        let dpp = await prisma.dppProgress.findUnique({
            where: { userId: userId },
        });
        let quiz = await prisma.quizProgress.findUnique({
            where: { userId: userId },
        });

        // Fallback for legacy data or if not initialized
        if (!exam) exam = { attended: 0, accuracy: 0, lastRank: 0 } as any;
        if (!dpp) dpp = { solvedCount: 0, questionsSolved: 0 } as any;
        if (!quiz) quiz = { attended: 0, totalScore: 0 } as any;

        return {
            exam,
            dpp,
            quiz,
            // Computed aggregate stats for convenience
            totalAttended: (exam?.attended || 0) + (quiz?.attended || 0),
        };
    }

    // sql 
    async getTopNOfAnExam(userId: string, examId: string, offset: string = "4") {
        let data: Leaderboard[] = [];
        data = await this.get_user_leaderboard(
            examId,
            userId,
            parseInt(offset)
        );
        return data;
    }

    async get_user_leaderboard(examId: string, userId: string, topLimit: number = 4): Promise<Leaderboard[]> {

        const result = await prisma.$queryRaw<Leaderboard[]>`
WITH top_n AS (
    SELECT l.user_id, u.name, l.score, l.rank
    FROM leaderboard l
    JOIN "User" u ON l.user_id = u.id
    WHERE l.exam_id = ${examId}
    ORDER BY l.rank ASC
    LIMIT ${topLimit}
),
my_rank AS (
    SELECT l.user_id, u.name, l.score, l.rank
    FROM leaderboard l
    JOIN "User" u ON l.user_id = u.id
    WHERE l.exam_id = ${examId}
    AND l.user_id = ${userId}
),
extra_user AS (
    SELECT l.user_id, u.name, l.score, l.rank
    FROM leaderboard l
    JOIN "User" u ON l.user_id = u.id
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
        return result;
    }

    async get_user_score(
        userId: string,
        interval: string,
        group: TimeGroup = "hour"
    ) {

        const config = {
            hour: {
                table: "user_score_summary_hour",
                column: "hour",
            },
            day: {
                table: "user_score_summary_day",
                column: "day",
            },
            week: {
                table: "user_score_summary_week",
                column: "week",
            },
            month: {
                table: "user_score_summary_month",
                column: "month",
            },
        }[group];

        const result = await prisma.$queryRawUnsafe<score[]>(`
    SELECT
      ${config.column} as time,
      total_score
    FROM
      ${config.table}
    WHERE
      user_id = $1
      AND ${config.column} >= NOW() - $2::INTERVAL
    ORDER BY
      ${config.column} ASC
  `, userId, interval);

        return result;
    }

    async getScoreMetrix(
        userid: string,
        offset: string,
        startDate?: string,
        endDate?: string
    ) {
        let interval = "7 DAYS";
        let data: score[] = [];


        data = await this.get_user_score(userid, interval, "week");

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
            let time = dayjs(item[offset]);
            let key = time.format("DD-MMM-YYYY");
            switch (offset) {
                case "week":
                    key = time.format("DD-MMM"); // day-month:weekno
                    break;
                case "month":
                    key = time.format("MMM-YY"); // day-month-year
                    break;
                case "hour":
                    key = time.format("ddd-MMM:hh A"); // day-month:hour:minute
                    break;
                case "minute":
                    key = time.format("ddd:hh:mm A"); // day-month:hour:minute
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


    async get_subject_wish_score(
        userId: string,
        interval: string,
        group: TimeGroup = "hour"
    ) {

        const config = {
            hour: {
                table: "subject_score_summary_hour",
                column: "hour",
            },
            day: {
                table: "subject_score_summary_day",
                column: "day",
            },
            week: {
                table: "subject_score_summary_week",
                column: "week",
            },
            month: {
                table: "subject_score_summary_month",
                column: "month",
            },
        }[group];



        const result = await prisma.$queryRawUnsafe<subjectScore[]>(`
    SELECT
    ${config.column} as time,
    subject,
    total_right,
    total_wrong
    FROM
      ${config.table}
    WHERE
      user_id = $1
      AND ${config.column} >= NOW() - $2::INTERVAL
    ORDER BY
      ${config.column} ASC,
      user_id
  `, userId, interval);



        return result;

    }

    async getSubjectScoreMetrix(
        userid: string,
        offset: string,
        startDate?: string,
        endDate?: string
    ) {
        let interval = "7 DAYS";
        let data: subjectScore[] = [];
        data = await this.get_subject_wish_score(userid, interval)
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

            const result = Object.keys(grouped).map((subject) => {
                const item = grouped[subject];
                return {
                    subject: item.subject,
                    A: item.A / item.count,
                    B: item.B / item.count,
                    fullMark: item.fullMark,
                };
            });

            return result;
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
