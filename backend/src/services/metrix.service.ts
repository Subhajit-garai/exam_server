import prisma from "@repo/db/index.js";
import { timeinpute } from "../zod/metrix.zod.js";
import dayjs from "dayjs";
import {
    get_subject_wish_daily_score,
    get_subject_wish_hour_score,
    get_subject_wish_minute_score,
    get_subject_wish_monthly_score,
    get_subject_wish_weekly_score,
    getdailyscore,
    gethourscore,
    getminutescore,
    getmonthlyscore,
    getweeklyscore,
    top_4_user_from_exam_leaderboard,
    top_10_user_from_exam_leaderboard,
} from "@repo/prisma/sql.js";

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

    async getTopNOfAnExam(userId: string, examId: string, offset: string = "4") {
        let data:
            | top_10_user_from_exam_leaderboard.Result[]
            | top_4_user_from_exam_leaderboard.Result[] = [];

        switch (offset) {
            case "10":
                data = await prisma.$queryRawTyped(
                    top_10_user_from_exam_leaderboard(examId, userId)
                );
                break;
            default:
                data = await prisma.$queryRawTyped(
                    top_4_user_from_exam_leaderboard(examId, userId)
                );
                break;
        }
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
        let data = await prisma.progress.findFirst({
            where: {
                userid: userId,
            },
        });
        return data;
    }

    async getScoreMetrix(
        userid: string,
        offset: string,
        startDate?: string,
        endDate?: string
    ) {
        let interval = "7 DAYS";
        let data:
            | getdailyscore.Result[]
            | getweeklyscore.Result[]
            | getmonthlyscore.Result[]
            | gethourscore.Result[]
            | getminutescore.Result[] = [];

        if (offset) {
            switch (offset) {
                case "week":
                    data = await prisma.$queryRawTyped(getweeklyscore(userid, interval));
                    break;
                case "month":
                    data = await prisma.$queryRawTyped(getmonthlyscore(userid, interval));
                    break;
                case "hour":
                    data = await prisma.$queryRawTyped(gethourscore(userid, interval));
                    break;
                case "minute":
                    data = await prisma.$queryRawTyped(getminutescore(userid, interval));
                    break;
                default:
                    data = await prisma.$queryRawTyped(getdailyscore(userid, interval)); // day
                    break;
            }
        }

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

    async getSubjectScoreMetrix(
        userid: string,
        offset: string,
        startDate?: string,
        endDate?: string
    ) {
        let interval = "7 DAYS";
        let data:
            | get_subject_wish_weekly_score.Result[]
            | get_subject_wish_daily_score.Result[]
            | get_subject_wish_monthly_score.Result[]
            | get_subject_wish_hour_score.Result[]
            | get_subject_wish_minute_score.Result[] = [];

        if (offset) {
            switch (offset) {
                case "week":
                    data = await prisma.$queryRawTyped(
                        get_subject_wish_weekly_score(userid, interval)
                    );
                    break;
                case "month":
                    data = await prisma.$queryRawTyped(
                        get_subject_wish_monthly_score(userid, interval)
                    );
                    break;
                case "hour":
                    data = await prisma.$queryRawTyped(
                        get_subject_wish_hour_score(userid, interval)
                    );
                    break;
                case "minute":
                    data = await prisma.$queryRawTyped(
                        get_subject_wish_minute_score(userid, interval)
                    );
                    break;
                default:
                    data = await prisma.$queryRawTyped(
                        get_subject_wish_daily_score(userid, interval)
                    ); // day
                    break;
            }
        }
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
