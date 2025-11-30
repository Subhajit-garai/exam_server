import { ExamType, Visibility } from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import { examManager } from "@repo/lib/manager/examManager.js";
import { ExamMetaData } from "@repo/lib/types.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { getServiceCharge, TokenDeduction } from "@repo/lib/helper/payment.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const em = examManager.getInstance();

export class ExamService {
    async deletexams() {
        let response = await prisma.exam.deleteMany({});
        return response;
    }

    async update_targeted_exam_year(data: any) {
        let isTargetdExam_Year = await prisma.examYear.findUnique({
            where: {
                id: data.exam_year_id,
            },
        });

        if (!isTargetdExam_Year) {
            throw new Error("Porvided exam year id is invalid ");
        }

        let updated_target_exam_year = await prisma.examYear.update({
            where: {
                id: data?.exam_year_id,
            },
            data: {
                ...(data.category ? { category: data.category } : undefined),
                ...(data.registrationOpenDate
                    ? { registrationOpenDate: data.registrationOpenDate }
                    : undefined),
                ...(data.registrationCloseDate
                    ? { registrationCloseDate: data.registrationCloseDate }
                    : undefined),
                ...(data.notes ? { notes: data.notes } : undefined),
                ...(data.status ? { status: data.status } : undefined),
                ...(data.slug ? { slug: data.slug } : undefined),
            },
        });

        return updated_target_exam_year;
    }

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

    async getUserMetaDataforAnExam(userId: string, examId: string) {
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
                return { rignt: 0, wrong: 0 };
            }
            let rignt = 0;
            let wrong = 0;
            if (userScore?.result) {
                Object.keys(userScore.result).forEach((item: any) => {
                    rignt += userScore.result[item].Right;
                    wrong += userScore.result[item].Wrong;
                });
            }
            return { rignt, wrong };
        }

        let { rignt, wrong } = userTotalRightWrong(userScore);
        data.examid = examId;
        data.score = userScore ? userScore?.score : 0;
        data.rignt = rignt;
        data.wrong = wrong;
        data.attempts = 1;
        data.rank = userLeaderboard ? userLeaderboard?.rank : 0;
        data.inTop10 = userLeaderboard ? userLeaderboard?.rank : 0; // false;
        data.topperScore = topper ? topper?.score : 0;

        return data;
    }

    async gettokenSystem(userId: string, type: any) {
        let data = await getServiceCharge(undefined, type, userId);
        return data;
    }

    async getCategory() {
        let response = await prisma.targetExam.findMany({
            distinct: ["category"],
            select: {
                category: true,
            },
        });

        if (!response) {
            throw new Error("Can not find any Category");
        }
        let Category = response.flat().map((item) => item.category);
        return Category;
    }

    async fetch_targeted_exam_by_id(id: string) {
        let target_exam = await prisma.targetExam.findFirst({
            where: {
                id: id,
            },
        });

        if (!target_exam) throw Error("Target exam not found");
        return target_exam;
    }

    async ExamAttemptQuestionMetaData(userId: string, examId: string) {
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

    async submitAnswerhandler(
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

    async finalsubmitExam(userId: string, examId: string) {
        let status = await em.submitExam(examId, userId);
        return status;
    }

    async joinedExamData(
        userId: string,
        examId: string,
        type: string,
        number: number,
        part: string
    ) {
        let question = await em.getquestion(type, examId, userId, part, number);
        return question;
    }

    async examJoinRequestProcess(userId: string, examId: string) {
        let isUserVerified = await prisma.user.findFirst({
            where: { id: userId },
            select: {
                social: {
                    select: {
                        isEmailVerified: true,
                        isTelegramVerified: true,
                    },
                },
            },
        });

        if (
            !(
                isUserVerified?.social?.isEmailVerified &&
                isUserVerified.social.isTelegramVerified
            )
        ) {
            throw new Error(
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
            },
        });

        if (!exam) {
            throw new Error("Can not find any exam");
        }

        if (exam.creationstatus === "Done") {
            if (exam.examtype !== "Mock" && exam.examtype !== "PYQ") {
                if (isUserGivenThisExam && isUserGivenThisExam.id) {
                    throw new Error(
                        "You have already taken this exam. Please join the next one."
                    );
                }

                // join time checking
                {
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
                                throw new Error("Exam Joining Time is over");
                            }
                        } else {
                            let remainingTime = Math.max(
                                startTime.diff(currentISTTime, "minutes"),
                                0
                            );
                            throw new Error(
                                `Exam not started yet , remining time is ${remainingTime} m`
                            );
                        }
                    } else {
                        throw new Error("Exam Joining Time is over/not started");
                    }
                }
            }

            // transaction point
            await prisma.$transaction(async (tx: any) => {
                let transaction = await TokenDeduction(
                    tx,
                    userId,
                    exam.examtype,
                    "service"
                );

                if (transaction) {
                    em.addexam(exam.id);
                    console.log("date added into exam manager");
                    em.user.adduser(examId, userId);
                    console.log("user added into exam manager");
                }
            });
        }

        return true;
    }

    async getExamYearInfo(examname: string, id: string) {
        let exam_year;
        if (id) {
            exam_year = await prisma.examYear.findFirst({
                where: {
                    id: id,
                },
            });
        } else {
            exam_year = await prisma.examYear.findMany({
                where: {
                    targetExam: {
                        shortCode: examname,
                    },
                },
            });
        }

        if (!exam_year) throw Error("exam year info not  found");
        return exam_year;
    }

    async getExamsbyid(id: string) {
        let response = await prisma.exam.findMany({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                examname: true,
                display_id: true,
                exam_pattern: {
                    select: {
                        id: true,
                        total_questions: true,
                        syllabus: true,
                        difficulty: true,
                        format: true,
                    },
                },
                category: true,
                Visibility: true,
                examtype: true,
                starttime: true,
                creationstatus: true,

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
        let response;
        let total;

        if (starttime && endtime) {
            response = await prisma.exam.findMany({
                where: {
                    AND: [
                        {
                            OR: [{ created_by: userId }, { Visibility: Visibility.Public }],
                        },
                        {
                            date: {
                                gte: starttime,
                                lte: endtime,
                            },
                        },
                    ],
                    ...(type ? { examtype: type } : {}),
                    creationstatus: "Done",
                },
                select: {
                    id: true,
                    name: true,
                    examname: true,
                    display_id: true,
                    exam_pattern: {
                        select: {
                            id: true,
                            total_questions: true,
                            syllabus: true,
                            difficulty: true,
                            format: true,
                        },
                    },
                    category: true,
                    Visibility: true,
                    examtype: true,
                    starttime: true,
                    creationstatus: true,
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

            total = await prisma.exam.count({
                where: {
                    AND: [
                        {
                            OR: [{ created_by: userId }, { Visibility: Visibility.Public }],
                        },
                        {
                            date: {
                                gte: starttime,
                                lte: endtime,
                            },
                        },
                    ],
                    ...(type ? { examtype: type } : {}),
                    creationstatus: "Done",
                },
            });
        } else {
            response = await prisma.exam.findMany({
                where: {
                    OR: [{ created_by: userId }, { Visibility: Visibility.Public }],
                    ...(type ? { examtype: type } : {}),
                },
                select: {
                    id: true,
                    name: true,
                    examname: true,
                    display_id: true,
                    exam_pattern: {
                        select: {
                            id: true,
                            total_questions: true,
                            syllabus: true,
                            difficulty: true,
                            format: true,
                        },
                    },
                    category: true,
                    Visibility: true,
                    examtype: true,
                    starttime: true,
                    creationstatus: true,

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

            total = await prisma.exam.count({
                where: {
                    OR: [{ created_by: userId }, { Visibility: Visibility.Public }],
                    ...(type ? { examtype: type } : {}),
                },
            });
        }

        return { exams: response, total, currentPage: page };
    }

    async getAvalibletargetExamAll() {
        let response = await prisma.targetExam.findMany({
            select: {
                name: true,
                shortCode: true,
                id: true,
            },
        });

        if (!(response.length > 0)) {
            throw new Error("Can not find any exam");
        }

        let AvalibleExam = response.flat();
        return AvalibleExam;
    }

    async getAvalibletargetExam(category: string) {
        let response = await prisma.targetExam.findMany({
            where: {
                category: category,
            },
            select: {
                name: true,
                shortCode: true,
                id: true,
            },
        });

        if (!(response.length > 0)) {
            throw new Error("Can not find any exam");
        }

        let AvalibleExam = response.flat();
        return AvalibleExam;
    }

    async getAvalibleExamPattern(exam: string, userId: string) {
        let response = await prisma.exam_pattern.findMany({
            where: {
                examname: exam,
                created_by: userId,
            },
            select: {
                id: true,
                title: true,
            },
        });

        if (!response) {
            throw new Error("Can not find any exampattern");
        }

        return response;
    }
}
