import {
    ExamType,
    SocialPlatform,
    Visibility,
} from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import { ExamManager } from "@repo/lib/manager/examManager.js";
import { ExamMetaData } from "@repo/lib/types.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { getServiceCharge, TokenDeduction } from "@repo/lib/helper/payment.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ProgressService } from "./progress.service.js";


dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const em = ExamManager.getInstance();

export class ExamService {
    // async deletexams() {
    //     let response = await prisma.exam.deleteMany({});
    //     return response;
    // }


    async getUserAnsSetOfAnExam(userId: string, examId: string) {
        let data = await prisma.userAns.findMany({
            where: {
                userId: userId,
                examId: examId,
            },
            select: {
                selectedOption: true,
                shuffleMap: true,
                part: true,
                number: true,

                Question: {
                    select: {
                        id: true,
                        options: true,
                        title: true,
                        ans: true,
                        extra: true,
                        format: true,
                        is_multiple_ans: true,
                        explanation: true,
                        Subject: {
                            select: {
                                name: true,
                                shortName: true,
                            },
                        },
                        Topic: {
                            select: {
                                name: true,
                                shortName: true,
                            },
                        },
                    },
                },
            },
        });
        return data;
    }

    async getUserMetaDataForExam(userId: string, examId: string) {
        let data: ExamMetaData = {} as ExamMetaData;

        let userScore = await prisma.score.findFirst({
            where: {
                user_id: userId,
                exam_id: examId,
            },
            select: {
                score: true,
                result: true,
            },
        });
        let userLeaderboard = await prisma.leaderboard.findFirst({
            where: {
                user_id: userId,
                exam_id: examId,
            },
            select: {
                rank: true,
            },
        });
        let topper = await prisma.leaderboard.findFirst({
            where: {
                exam_id: examId,
                rank: 1,
            },
            select: {
                user_id: true,
                score: true,
            },
        });

        function userTotalRightWrong(userScore: any) {
            if (!userScore?.result) {
                return { right: 0, wrong: 0 };
            }
            let right = 0;
            let wrong = 0;
            if (userScore?.result) {
                Object.keys(userScore.result).forEach((item: any) => {
                    right += userScore.result[item].Right;
                    wrong += userScore.result[item].Wrong;
                });
            }
            return { right, wrong };
        }

        let { right, wrong } = userTotalRightWrong(userScore);
        data.examid = examId;
        data.score = userScore ? userScore?.score : 0;
        data.rignt = right;
        data.wrong = wrong;
        data.attempts = 1;
        data.rank = userLeaderboard ? userLeaderboard?.rank : 0;
        data.inTop10 = userLeaderboard ? userLeaderboard?.rank : 0; // false;
        data.topperScore = topper ? topper?.score : 0;

        return data;
    }

    async getTokenSystem(userId: string, type: any) {
        let data = await getServiceCharge(undefined, type, userId);
        return data;
    }

    async getCategoryName() {
        let response = await prisma.category.findMany({});
        let Category = response.map((item) => item.name);

        if (!response) {
            throw new Error("Can not find any Category");
        }
        return Category;
    }

    async getExamAttemptQuestionMetaData(userId: string, examId: string) {
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

    async submitAnswerHandler(
        userId: string,
        examId: string,
        number: string,
        part: string,
        ans: string,
        ismultiple: boolean
    ) {
        let Ans = ans.split(",");
        let status = await em.submitAnswer(
            examId,
            userId,
            part,
            Ans,
            number,
            ismultiple
        );
        return status;
    }

    async finalSubmitExam(userId: string, examId: string) {
        let status = await em.submitExam(examId, userId);

        try {
            const progressService = new ProgressService();
            await progressService.updateExamProgress(userId, examId);
        } catch (error) {
            console.error("Failed to update user progress:", error);
        }


        return status;
    }

    async getJoinedExamData(
        userId: string,
        examId: string,
        type: "pre" | "next" | "current",
        number: number,
        part: string
    ) {
        let question = await em.getQuestion(type, examId, userId, part, number);
        return question;
    }

    async examJoinRequestProcess(userId: string, examId: string) {

        let isEmailVerified = await prisma.social.findFirst({
            where: {
                userId: userId,
                platform: SocialPlatform.email

            },
        });


        if (
            !(
                isEmailVerified?.isVerified
            )
        ) {
            throw new CustomError(
                "The user needs to verify their account to take the given exam"
            );
        }

        let isUserGivenThisExam = await prisma.score.findFirst({
            where: {
                exam_id: examId,
                user_id: userId,
            },
            select: {
                id: true,
            },
        });

        // exam data

        let exam = await prisma.exam.findFirst({
            where: { id: examId },
            select: {
                id: true,
                creationstatus: true,
                examtype: true,
                starttime: true,
                jointime: true,
                date: true,
                access_type: true
            },
        });

        if (!exam) {
            throw new CustomError("Can not find any exam");
        }

        if (exam.creationstatus === "Done") {

            if (exam.examtype !== "Mock" && exam.examtype !== "PYQ") {
                if (isUserGivenThisExam && isUserGivenThisExam.id) {
                    throw new CustomError(
                        "You have already taken this exam. Please join the next one."
                    );
                }

                // join time checking
                this.isExamSessionActive(exam);
            }

            // transaction point

            if (exam.access_type === "Paid") {


                await prisma.$transaction(async (tx: any) => {
                    await TokenDeduction(
                        tx,
                        userId,
                        exam.examtype,
                        "service"
                    );
                });

            }


            await em.addExam(exam.id);
            console.log("date added into exam manager");
            await em.addUser(examId, userId);
            console.log("user added into exam manager");

        }

        return true;
    }


    async createExam(data: any, userId: string) {
        let {
            name,
            exam_pattern_id,
            Visibility,
            duration,
            date,
            jointime,
            starttime,
            examtype,
        } = data;

        let response = await prisma.exam.create({
            data: {
                name,
                Visibility,
                examtype: examtype,
                starttime: starttime ? starttime : "no limit",
                jointime: jointime ? jointime : "no limit",
                duration: duration ? duration : "02:00 h",
                date: date,
                exam_pattern: {
                    connect: { id: exam_pattern_id },
                },
                User: {
                    connect: { id: userId }, // createdby
                },
                ContestRegister: {
                    create: {},
                },
            },
        });

        if (!response) {
            throw new Error(`${examtype} not created , try again later `);
        }
        let Notifystatus = await em.refresh(response.id, userId)

        // call back to user
        if (Notifystatus) {
            console.log(`${examtype} Created ....`);
        }

        return response;
    }


    async refresh(examid: string, userid: string) {
        return em.refresh(examid, userid)
    }

    async getExamsById(id: string) {
        let response = await prisma.exam.findMany({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                exam_pattern: {
                    select: {
                        id: true,
                        total_questions: true,
                        examname: true,
                        syllabus: true,
                        difficulty: true,
                        format: true,
                        Category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    },
                },
                Visibility: true,
                examtype: true,
                starttime: true,
                creationstatus: true,
                access_type: true,

                date: true,
                duration: true,
                jointime: true,
                ContestRegister: {
                    select: {
                        count: true,
                    },
                },
            },
        });
        return response;
    }

    async getExams(
        userId: string,
        type: ExamType,
        page: number = 1,
        limit: number = 10,
        order: "desc" | "asc" = "desc",
        starttime?: string,
        endtime?: string
    ) {
        const where: any = {
            OR: [{ created_by: userId }, { Visibility: Visibility.Public }],
            ...(type ? { examtype: type } : {}),
        };

        if (starttime && endtime) {
            where.AND = [
                {
                    date: {
                        gte: starttime,
                        lte: endtime,
                    },
                },
            ];
            where.creationstatus = "Done";
        }

        const response = await prisma.exam.findMany({
            where,
            select: {
                id: true,
                name: true,
                display_id: true,
                exam_pattern: {
                    select: {
                        id: true,
                        total_questions: true,
                        examname: true,
                        syllabus: true,
                        difficulty: true,
                        format: true,
                        Category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true
                            }
                        }
                    },
                },
                Visibility: true,
                examtype: true,
                starttime: true,
                creationstatus: true,
                access_type: true,
                date: true,
                duration: true,
                jointime: true,
                ContestRegister: {
                    select: {
                        count: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { date: order },
        });

        const total = await prisma.exam.count({
            where,
        });

        return { exams: response, total, currentPage: page };
    }

    private isExamSessionActive(exam: any) {
        let examDate = dayjs.utc(exam.date).tz("Asia/Kolkata");
        let currentISTTime = dayjs.utc().tz("Asia/Kolkata");

        let isSame = currentISTTime.isSame(examDate, "day");
        let date = examDate.format("DD-MM-YYYY");

        if (isSame) {
            let startTime = dayjs.tz(
                `${date} ${exam.starttime}`,
                "DD-MM-YYYY hh:mm a",
                "Asia/Kolkata"
            );
            let started = currentISTTime.isAfter(startTime);

            if (started) {
                let jointime = exam?.jointime as string;
                if (jointime == "no limit") {
                    jointime = "00:15 m";
                }
                const minutesMatch = jointime.match(/(\d+):(\d+)/);
                let joinTimeLimit;
                if (minutesMatch) {
                    const [_, hours, minutes] = minutesMatch.map(Number);
                    joinTimeLimit = startTime
                        .add(hours, "hour")
                        .add(minutes, "minute");
                } else {
                    console.error("Invalid jointime format:", jointime);
                }

                let isExamJoinTimeExecd = currentISTTime.isAfter(joinTimeLimit);

                if (isExamJoinTimeExecd) {
                    throw new CustomError("Exam Joining Time is over");
                }
            } else {
                let remainingTime = Math.max(
                    startTime.diff(currentISTTime, "minutes"),
                    0
                );
                throw new CustomError(
                    `Exam not started yet , remining time is ${remainingTime} m`
                );
            }
        } else {
            throw new CustomError("Exam Joining Time is over/not started");
        }
    }
}
