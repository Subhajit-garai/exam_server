import {
    ExamType,
    SocialPlatform,
    Visibility,
    syllabusType,
} from "@repo/prisma/client.js";
import prisma from "@repo/db/index.js";
import { ExamManager } from "@repo/lib/manager/examManager.js";
import { ExamMetaData } from "@repo/lib/types.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { getServiceCharge, TokenDeduction } from "@repo/lib/helper/payment.js";
import { ConvertInSlug } from "@/lib/slug.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ProgressService } from "./progress.service.js";
import { ExampatternInputType } from "@/zod/user.zod.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const em = ExamManager.getInstance();

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


    async getCategoryName() {
        let response = await prisma.category.findMany({});
        let Category = response.map((item) => item.name);

        if (!response) {
            throw new Error("Can not find any Category");
        }
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

        try {
            const progressService = new ProgressService();
            await progressService.updateExamProgress(userId, examId);
        } catch (error) {
            console.error("Failed to update user progress:", error);
        }


        return status;
    }

    async joinedExamData(
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
        let istelegramVerified = await prisma.social.findFirst({
            where: {
                userId: userId,
                platform: SocialPlatform.telegram

            },
        });
        let isEmailVerified = await prisma.social.findFirst({
            where: {
                userId: userId,
                platform: SocialPlatform.email

            },
        });


        if (
            !(
                isEmailVerified?.isVerified &&
                istelegramVerified?.isVerified
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

            // transaction point
            await prisma.$transaction(async (tx: any) => {
                let transaction = await TokenDeduction(
                    tx,
                    userId,
                    exam.examtype,
                    "service"
                );

                if (transaction) {
                    await em.addExam(exam.id);
                    console.log("date added into exam manager");
                    await em.addUser(examId, userId);
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
                Category: {
                    name: category
                }
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
                examname: true,
                difficulty: true,
                format: true,
            },
        });

        if (!response) {
            throw new Error("Can not find any exampattern");
        }

        return response;
    }

    async createExamPattern(data: ExampatternInputType, userId: string) {
        let {
            title,
            checkbox,
            format,
            examname,
            category,
            topics,
            difficulty,
            part,
            part_Count,
            total_questions,
            checktype,
            marks_values,
            neg_values,
            examyear,
            syllabus,
        } = data;

        let syllabusData;

        if (checkbox) {
            if (!syllabus) throw Error("syllabus not found ");

            let examYearData = await prisma.examYear.findFirst({
                where: {
                    targetExam: {
                        name: examname,
                    },
                    year: parseInt(examyear),
                },
            });

            if (!examYearData) throw Error("examYearData not found ");

            syllabusData = await prisma.syllabus.findFirst({
                where: {
                    exam_year_id: examYearData.id,
                    title: syllabus,
                },
            });

            if (!syllabusData) throw Error("syllabusdata not found ");

        } else {
            if ((topics?.length as number) < 1) {
                throw new Error("Topics is Empty ");
            }
        }

        let response = await prisma.exam_pattern.create({
            data: {
                title,
                format,
                examname,
                ...(category ? { Category: { connect: { name: category } } } : {}),
                topics,
                difficulty,
                part,
                part_Count: parseInt(part_Count),
                total_questions,
                check: checktype,
                checkbox,
                marks_values,
                neg_values,
                syllabus: checkbox ? syllabusType.Syllabus : syllabusType.Generic,
                ...(syllabusData && { syllabusid: syllabusData.id }),
                User: {
                    connect: { id: userId },
                },
            },
        });

        if (!response) throw Error(" exam patten not created ");

        return response;
    }

    async createTargetedExam(data: any) {
        let categoryData = await prisma.category.findFirst({
            where: {
                name: data.category,
            },
        });

        if (!categoryData) throw Error("category not found ");

        let { category, ...rest } = data;
        let target_exam = await prisma.targetExam.create({
            data: {
                ...rest,
                ...(categoryData && { Category: { connect: { id: categoryData.id } } }),
            },
        });

        return target_exam;
    }

    async createTargetedExamYear(data: any) {
        let target_exam_data = await prisma.targetExam.findFirst({
            where: {
                id: data.targetExamId,
            },
        });

        if (!target_exam_data) throw new Error("select valid exam name ");

        data.slug = ConvertInSlug(
            `${target_exam_data.shortCode} ${data.year}`
        );

        let target_exam_year = await prisma.examYear.create({
            data: {
                ...data,
                slug: data.slug,
                year: parseInt(data.year),
            },
        });

        if (!target_exam_year) throw new Error("targated_exam_year not created ");
        return target_exam_year;
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

        // send it into queue to process question
        let { id } = response;
        let Notifystatus = await em.getRedisClient().push({
            type: "CREATE_EXAM",
            id: id,
            payload: {
                examid: id,
                userid: userId,
                examtype: response.examtype,
            },
            variant: response.examtype,
            category: "JECA",
        });

        // call back to user
        if (Notifystatus) {
            console.log(`${examtype} Created ....`);
        }

        return response;
    }


    async getExamPatternById(id: string) {
        let response = await prisma.exam_pattern.findUnique({
            where: { id: id },
            include: {
                Category: true
            }
        });
        if (!response) throw new Error("Exam Pattern not found");
        return response;
    }

    async updateExamPattern(data: any, userId: string) {
        let { id, ...updateData } = data;

        // Remove fields that shouldn't be updated or transform them if needed
        if (updateData.checkbox && !updateData.syllabus) {
            // If checkbox is enabling syllabus but syllabus not provided, we might need logic here
            // but schema validation should handle it.
            // For now, pass all data.
        }

        // Logic similar to create for syllabus mapping if needed
        let syllabusData;
        if (updateData.checkbox && updateData.syllabus && updateData.examname && updateData.examyear) {
            let examYearData = await prisma.examYear.findFirst({
                where: {
                    targetExam: { name: updateData.examname },
                    year: parseInt(updateData.examyear),
                },
            });
            if (examYearData) {
                syllabusData = await prisma.syllabus.findFirst({
                    where: { exam_year_id: examYearData.id, title: updateData.syllabus },
                });
            }
        }

        let response = await prisma.exam_pattern.update({
            where: { id: id },
            data: {
                ...updateData,
                ...(syllabusData && { syllabusid: syllabusData.id }),
                // userId not updated usually, or track last updated by?
            }
        });
        return response;
    }

    async deleteExamPattern(id: string) {
        // Check if used in any Exam
        let usage = await prisma.exam.findFirst({
            where: { exam_pattern_id: id }
        });
        if (usage) throw new Error("Cannot delete pattern: It is used in one or more Exams.");

        let response = await prisma.exam_pattern.delete({
            where: { id: id }
        });
        return response;
    }
}

