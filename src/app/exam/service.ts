import { ExamType, Visibility } from "@/db/schema/enums.js";
import { db } from "@/db/index.js";
import {
  exams,
  exam_patterns,
  exam_years,
  target_exams,
} from "@/db/schema/exam.js";
import { socials, user_answers } from "@/db/schema/user.js";
import { scores, leaderboards } from "@/db/schema/score.js";
import { categories, subjects, topics } from "@/db/schema/note.js";
import { contest_registers } from "@/db/schema/schema.js";
import { questions } from "@/db/schema/question.js";
import {
  eq,
  and,
  desc as drizzleDesc,
  or,
  gte,
  lte,
  count as drizzleCount,
  asc as drizzleAsc,
} from "drizzle-orm";
import { ExamManager } from "@/lib/manager/examManager.js";
import { ExamMetaData } from "@/lib/types/types.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { TokenDeduction } from "@/utils/payment.js";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ProgressService } from "../progress/service.js";
import { logger } from "@/utils/logger.js";
import { syllabuses } from "@/db/schema/syllabus.js";
import { exam_timelines } from "@/db/schema/examtimeline.js";
import { ConvertInSlug } from "@/utils/slug.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const em = ExamManager.getInstance();

export class ExamService {
  async getUserAnsSetOfAnExam(userId: string, examId: string) {
    const rawData = await db
      .select({
        selectedOption: user_answers.selected_option,
        shuffleMap: user_answers.shuffle_map,
        part: user_answers.part,
        number: user_answers.number,
        questionId: questions.id,
        options: questions.options,
        title: questions.title,
        ans: questions.ans,
        extra: questions.extra,
        format: questions.format,
        is_multiple_ans: questions.is_multiple_answers,
        explanation: questions.explanation,
        subjectName: subjects.name,
        subjectShortName: subjects.short_name,
        topicName: topics.name,
        topicShortName: topics.short_name,
      })
      .from(user_answers)
      .leftJoin(questions, eq(user_answers.question_id, questions.id))
      .leftJoin(subjects, eq(questions.subject_id, subjects.id))
      .leftJoin(topics, eq(questions.topic_id, topics.id))
      .where(
        and(eq(user_answers.user_id, userId), eq(user_answers.exam_id, examId)),
      );

    return rawData.map((row) => ({
      selectedOption: row.selectedOption,
      shuffleMap: row.shuffleMap,
      part: row.part,
      number: row.number,
      Question: row.questionId
        ? {
            id: row.questionId,
            options: row.options,
            title: row.title,
            ans: row.ans,
            extra: row.extra,
            format: row.format,
            is_multiple_ans: row.is_multiple_ans,
            explanation: row.explanation,
            Subject: row.subjectName
              ? {
                  name: row.subjectName,
                  shortName: row.subjectShortName,
                }
              : null,
            Topic: row.topicName
              ? {
                  name: row.topicName,
                  shortName: row.topicShortName,
                }
              : null,
          }
        : null,
    }));
  }

  async getUserMetaDataForExam(userId: string, examId: string) {
    let data: ExamMetaData = {} as ExamMetaData;

    const [userScore] = await db
      .select({ score: scores.score, result: scores.result })
      .from(scores)
      .where(and(eq(scores.user_id, userId), eq(scores.exam_id, examId)))
      .limit(1);

    const [userLeaderboard] = await db
      .select({ rank: leaderboards.rank })
      .from(leaderboards)
      .where(
        and(eq(leaderboards.user_id, userId), eq(leaderboards.exam_id, examId)),
      )
      .limit(1);

    const [topper] = await db
      .select({ user_id: leaderboards.user_id, score: leaderboards.score })
      .from(leaderboards)
      .where(and(eq(leaderboards.exam_id, examId), eq(leaderboards.rank, 1)))
      .limit(1);

    const userTotalRightWrong = (userScore: any) => {
      if (!userScore?.result) return { right: 0, wrong: 0 };
      let right = 0;
      let wrong = 0;
      const result = userScore.result as any;
      Object.keys(result).forEach((item: any) => {
        right += result[item].Right || 0;
        wrong += result[item].Wrong || 0;
      });
      return { right, wrong };
    };

    let { right, wrong } = userTotalRightWrong(userScore);
    data.examid = examId;
    data.score = userScore ? userScore.score || 0 : 0;
    data.rignt = right;
    data.wrong = wrong;
    data.attempts = 1;
    data.rank = userLeaderboard ? userLeaderboard.rank || 0 : 0;
    data.inTop10 = userLeaderboard ? userLeaderboard.rank || 0 : 0;
    data.topperScore = topper ? topper.score || 0 : 0;

    return data;
  }

  async getCategoryName() {
    const response = await db
      .select({ name: categories.name })
      .from(categories);
    if (!response) throw new Error("Can not find any Category");
    return response.map((item) => item.name);
  }

  async getExamAttemptQuestionMetaData(userId: string, examId: string) {
    const [data] = await db
      .select({
        not_attempt: scores.not_attempt,
        total_questions: scores.total_questions,
      })
      .from(scores)
      .where(and(eq(scores.user_id, userId), eq(scores.exam_id, examId)))
      .limit(1);
    return data;
  }

  async submitAnswerHandler(
    userId: string,
    examId: string,
    number: string,
    part: string,
    ans: string,
    ismultiple: boolean,
  ) {
    let Ans = ans.split(",");
    let status = await em.submitAnswer(
      examId,
      userId,
      part,
      Ans,
      number,
      ismultiple,
    );
    return status;
  }

  async finalSubmitExam(userId: string, examId: string) {
    let status = await em.submitExam(examId, userId);

    try {
      const progressService = new ProgressService();
      await progressService.updateExamProgress(userId, examId);
    } catch (error) {
      logger.error("Failed to update user progress:", error);
    }

    return status;
  }

  async getJoinedExamData(
    userId: string,
    examId: string,
    type: "pre" | "next" | "current",
    number: number,
    part: string,
  ) {
    let question = await em.getQuestion(type, examId, userId, part, number);
    return question;
  }

  async examJoinRequestProcess(userId: string, examId: string) {
    // temporarily disabled for render deployment
    // const [isEmailVerified] = await db.select().from(socials).where(and(eq(socials.user_id, userId), eq(socials.platform, "email"))).limit(1);

    // if (!isEmailVerified?.is_verified) {
    //     throw new CustomError("The user needs to verify their account to take the given exam");
    // }

    const [isUserGivenThisExam] = await db
      .select({ id: scores.id })
      .from(scores)
      .where(and(eq(scores.exam_id, examId), eq(scores.user_id, userId)))
      .limit(1);

    const [exam] = await db
      .select({
        id: exams.id,
        creation_status: exams.creation_status,
        examtype: exams.exam_type,
        start_time: exams.start_time,
        join_time: exams.join_time,
        date: exams.date,
        access_type: exams.access_type,
      })
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (!exam) throw new CustomError("Can not find any exam");

    if (exam.creation_status === "Done") {
      if (exam.examtype !== "Mock" && exam.examtype !== "PYQ") {
        if (isUserGivenThisExam?.id) {
          throw new CustomError(
            "You have already taken this exam. Please join the next one.",
          );
        }
        this.isExamSessionActive(exam);
      }

      if (exam.access_type === "Paid") {
        // await db.transaction(async (tx) => {
        //     await TokenDeduction(tx, userId, exam.examtype, "service");
        // });
      }

      await em.addExam(exam.id);
      logger.debug("Exam added to exam manager");
      await em.addUser(examId, userId);
      logger.debug("User added to exam manager");
    }

    return true;
  }

  async createExam(data: any, userId: string) {
    let {
      name,
      exam_pattern_id,
      Visibility: visibility,
      duration,
      date,
      jointime,
      starttime,
      examtype,
    } = data;

    return await db.transaction(async (tx) => {
      const [register] = await tx
        .insert(contest_registers)
        .values({ count: 0 })
        .returning();
      const [newExam] = await tx
        .insert(exams)
        .values({
          name,
          visibility: visibility,
          exam_type: examtype,
          start_time: starttime || "08:00 pm",
          join_time: jointime || "00:15 m",
          duration: duration || "02:00 h",
          date,
          exam_pattern_id,
          created_by: userId,
          register_id: register.id,
        })
        .returning();

      if (!newExam) throw new Error(`${examtype} not created, try again later`);

      let Notifystatus = await em.refresh(newExam.id, userId);
      if (Notifystatus) logger.success(`${examtype} created`);

      return newExam;
    });
  }

  async refresh(examid: string, userid: string) {
    return em.refresh(examid, userid);
  }

  async getExamsById(id: string) {
    const rawExam = await db
      .select({
        id: exams.id,
        name: exams.name,
        Visibility: exams.visibility,
        examtype: exams.exam_type,
        starttime: exams.start_time,
        creationstatus: exams.creation_status,
        access_type: exams.access_type,
        date: exams.date,
        duration: exams.duration,
        jointime: exams.join_time,
        patternId: exam_patterns.id,
        total_questions: exam_patterns.total_questions,
        examname: exam_patterns.exam_name,
        syllabus: exam_patterns.syllabus,
        difficulty: exam_patterns.difficulty,
        format: exam_patterns.format,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        contestRegisterCount: contest_registers.count,
      })
      .from(exams)
      .leftJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .leftJoin(categories, eq(exam_patterns.category_id, categories.id))
      .leftJoin(contest_registers, eq(exams.register_id, contest_registers.id))
      .where(eq(exams.id, id));

    return rawExam.map((row) => ({
      id: row.id,
      name: row.name,
      exam_pattern: row.patternId
        ? {
            id: row.patternId,
            total_questions: row.total_questions,
            examname: row.examname,
            syllabus: row.syllabus,
            difficulty: row.difficulty,
            format: row.format,
            Category: row.categoryId
              ? {
                  id: row.categoryId,
                  name: row.categoryName,
                  slug: row.categorySlug,
                }
              : null,
          }
        : null,
      Visibility: row.Visibility,
      examtype: row.examtype,
      starttime: row.starttime,
      creationstatus: row.creationstatus,
      access_type: row.access_type,
      date: row.date,
      duration: row.duration,
      jointime: row.jointime,
      ContestRegister:
        row.contestRegisterCount !== null
          ? {
              count: row.contestRegisterCount,
            }
          : null,
    }));
  }

  async getExams(
    userId: string,
    type: ExamType,
    page: number = 1,
    limit: number = 10,
    order: "desc" | "asc" = "desc",
    starttime?: string,
    endtime?: string,
  ) {
    const filters: any[] = [
      or(eq(exams.created_by, userId), eq(exams.visibility, "Public")),
    ];

    if (type) filters.push(eq(exams.exam_type, type));
    if (starttime && endtime) {
      filters.push(gte(exams.date, new Date(starttime)));
      filters.push(lte(exams.date, new Date(endtime)));
      filters.push(eq(exams.creation_status, "Done"));
    }

    const response = await db
      .select({
        id: exams.id,
        name: exams.name,
        display_id: exams.display_id,
        Visibility: exams.visibility,
        examtype: exams.exam_type,
        starttime: exams.start_time,
        creationstatus: exams.creation_status,
        access_type: exams.access_type,
        date: exams.date,
        duration: exams.duration,
        jointime: exams.join_time,
        patternId: exam_patterns.id,
        total_questions: exam_patterns.total_questions,
        examname: exam_patterns.exam_name,
        syllabus: exam_patterns.syllabus,
        difficulty: exam_patterns.difficulty,
        format: exam_patterns.format,
        categoryId: categories.id,
        categoryName: categories.name,
        categorySlug: categories.slug,
        contestRegisterCount: contest_registers.count,
      })
      .from(exams)
      .leftJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .leftJoin(categories, eq(exam_patterns.category_id, categories.id))
      .leftJoin(contest_registers, eq(exams.register_id, contest_registers.id))
      .where(and(...filters))
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(order === "desc" ? drizzleDesc(exams.date) : exams.date);

    const totalResult = await db
      .select({ value: drizzleCount() })
      .from(exams)
      .where(and(...filters));
    const total = totalResult[0].value;

    const examsData = response.map((row) => ({
      id: row.id,
      name: row.name,
      display_id: row.display_id,
      exam_pattern: row.patternId
        ? {
            id: row.patternId,
            total_questions: row.total_questions,
            examname: row.examname,
            syllabus: row.syllabus,
            difficulty: row.difficulty,
            format: row.format,
            Category: row.categoryId
              ? {
                  id: row.categoryId,
                  name: row.categoryName,
                  slug: row.categorySlug,
                }
              : null,
          }
        : null,
      Visibility: row.Visibility,
      examtype: row.examtype,
      starttime: row.starttime,
      creationstatus: row.creationstatus,
      access_type: row.access_type,
      date: row.date,
      duration: row.duration,
      jointime: row.jointime,
      ContestRegister:
        row.contestRegisterCount !== null
          ? {
              count: row.contestRegisterCount,
            }
          : null,
    }));

    return { exams: examsData, total, currentPage: page };
  }

  private isExamSessionActive(exam: any) {
    let examDate = dayjs.utc(exam.date).tz("Asia/Kolkata");
    let currentISTTime = dayjs.utc().tz("Asia/Kolkata");

    let isSame = currentISTTime.isSame(examDate, "day");
    let date = examDate.format("DD-MM-YYYY");

    if (isSame) {
      let startTimeStr = exam.starttime || exam.start_time;
      let startTime = dayjs.tz(
        `${date} ${startTimeStr}`,
        "DD-MM-YYYY hh:mm a",
        "Asia/Kolkata",
      );
      let started = currentISTTime.isAfter(startTime);

      if (started) {
        let jointime = (exam.jointime || exam.join_time) as string;
        if (jointime == "no limit") {
          jointime = "00:15 m";
        }
        const minutesMatch = jointime.match(/(\d+):(\d+)/);
        let joinTimeLimit;
        if (minutesMatch) {
          const [_, hours, minutes] = minutesMatch.map(Number);
          joinTimeLimit = startTime.add(hours, "hour").add(minutes, "minute");
        } else {
          logger.warn("Invalid jointime format:", jointime);
        }

        let isExamJoinTimeExecd = joinTimeLimit
          ? currentISTTime.isAfter(joinTimeLimit)
          : false;

        if (isExamJoinTimeExecd) {
          throw new CustomError("Exam Joining Time is over");
        }
      } else {
        let remainingTime = Math.max(
          startTime.diff(currentISTTime, "minutes"),
          0,
        );
        throw new CustomError(
          `Exam not started yet, remining time is ${remainingTime} m`,
        );
      }
    } else {
      throw new CustomError("Exam Joining Time is over/not started");
    }
  }

  async updateExam(id: string, updateData: any) {
    const [response] = await db
      .update(exams)
      .set({
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.jointime && { join_time: updateData.jointime }),
        ...(updateData.starttime && { start_time: updateData.starttime }),
        ...(updateData.duration && { duration: updateData.duration }),
        ...(updateData.creationstatus && {
          creation_status: updateData.creationstatus,
        }),
        ...(updateData.access_type && { access_type: updateData.access_type }),
      })
      .where(eq(exams.id, id))
      .returning();

    return response;
  }

  async getOnlyExamById(id: string) {
    const rawResponse = await db
      .select()
      .from(exams)
      .leftJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .leftJoin(contest_registers, eq(exams.register_id, contest_registers.id))
      .where(eq(exams.id, id));

    if (rawResponse.length === 0) return null;

    const row = rawResponse[0];
    return {
      id: row.exams.id,
      name: row.exams.name,
      Visibility: row.exams.visibility,
      examtype: row.exams.exam_type,
      starttime: row.exams.start_time,
      access_type: row.exams.access_type,
      date: row.exams.date,
      duration: row.exams.duration,
      jointime: row.exams.join_time,
      creationstatus: row.exams.creation_status,
      exam_pattern: row.exam_patterns,
      exam_pattern_id: row.exams.exam_pattern_id,
      ContestRegister: row.contest_registers,
      isMultipleAttemp: row.exams.is_multiple_attempts,
      isLive: row.exams.is_live,
    };
  }

  async deleteExamResult(userId: string, examId: string) {
    const isAvailable = await db
      .select({ id: user_answers.id })
      .from(user_answers)
      .where(
        and(eq(user_answers.user_id, userId), eq(user_answers.exam_id, examId)),
      )
      .limit(1);

    if (isAvailable.length > 0) {
      await db
        .delete(user_answers)
        .where(
          and(
            eq(user_answers.user_id, userId),
            eq(user_answers.exam_id, examId),
          ),
        );
      await db
        .delete(scores)
        .where(and(eq(scores.user_id, userId), eq(scores.exam_id, examId)));
      await db
        .delete(leaderboards)
        .where(
          and(
            eq(leaderboards.user_id, userId),
            eq(leaderboards.exam_id, examId),
          ),
        );
      return "reset done";
    }

    return "nothing happend";
  }

  async getLeaderboard(examId: string, limit: number) {
    const rawLeaderboard = await db
      .select({
        id: leaderboards.id,
        rank: leaderboards.rank,
        score: leaderboards.score,
        time: leaderboards.time,
        user_id: leaderboards.user_id,
      })
      .from(leaderboards)
      .where(eq(leaderboards.exam_id, examId))
      .limit(limit);
    return rawLeaderboard;
  }
}

export class ExampatternService {
  async createExamPattern(data: any, userId: string) {
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
      if (!syllabus) throw Error("syllabus not found");

      const examYearDataList = await db
        .select({
          id: exam_years.id,
        })
        .from(exam_years)
        .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
        .where(
          and(
            eq(target_exams.name, examname),
            eq(exam_years.year, parseInt(examyear)),
          ),
        );

      if (examYearDataList.length === 0) throw Error("examYearData not found");
      const examYearData = examYearDataList[0];

      const [foundSyllabus] = await db
        .select({ id: syllabuses.id })
        .from(syllabuses)
        .where(
          and(
            eq(syllabuses.exam_year_id, examYearData.id),
            eq(syllabuses.title, syllabus),
          ),
        );

      if (!foundSyllabus) throw Error("syllabusdata not found");
      syllabusData = foundSyllabus;
    } else {
      if ((topics?.length as number) < 1) {
        throw new Error("Topics is Empty");
      }
    }

    let categoryId: string | null = null;
    if (category) {
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, category));
      if (cat) categoryId = cat.id;
    }

    const [response] = await db
      .insert(exam_patterns)
      .values({
        title,
        format,
        exam_name: examname,
        category_id: categoryId,
        topics,
        difficulty,
        part,
        part_count: parseInt(part_Count),
        total_questions,
        check: checktype,
        checkbox,
        marks_values,
        neg_values,
        syllabus: checkbox ? "Syllabus" : "Generic",
        syllabus_id: syllabusData?.id,
        created_by: userId,
      })
      .returning();

    if (!response) throw Error("exam pattern not created");

    return response;
  }

  async updateExamPattern(data: any, userId: string) {
    let { id, ...updateData } = data;

    let syllabusData;
    if (
      updateData.checkbox &&
      updateData.syllabus &&
      updateData.examname &&
      updateData.examyear
    ) {
      const examYearDataList = await db
        .select({
          id: exam_years.id,
        })
        .from(exam_years)
        .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
        .where(
          and(
            eq(target_exams.name, updateData.examname),
            eq(exam_years.year, parseInt(updateData.examyear)),
          ),
        );

      if (examYearDataList.length > 0) {
        const examYearData = examYearDataList[0];
        const [foundSyllabus] = await db
          .select({ id: syllabuses.id })
          .from(syllabuses)
          .where(
            and(
              eq(syllabuses.exam_year_id, examYearData.id),
              eq(syllabuses.title, updateData.syllabus),
            ),
          );
        syllabusData = foundSyllabus;
        delete updateData.syllabus;
      }
    }

    if (updateData.category) {
      const [categoryData] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, updateData.category));

      if (!categoryData) throw Error("category not found");
      updateData.category_id = categoryData.id;

      if (updateData.checktype) {
        updateData.check = updateData.checktype;
      }
      delete updateData.category;
      delete updateData.examyear;
      delete updateData.checktype;
    }

    if (updateData.examname) {
      updateData.exam_name = updateData.examname;
      delete updateData.examname;
    }

    const [response] = await db
      .update(exam_patterns)
      .set({
        ...updateData,
        ...(updateData.part_Count && {
          part_count: parseInt(updateData.part_Count),
        }),
        ...(syllabusData && { syllabus_id: syllabusData.id }),
      })
      .where(eq(exam_patterns.id, id))
      .returning();

    return response;
  }

  async getExamPatternById(id: string) {
    const [response] = await db
      .select()
      .from(exam_patterns)
      .leftJoin(categories, eq(exam_patterns.category_id, categories.id))
      .where(eq(exam_patterns.id, id));

    if (!response) throw new Error("Exam Pattern not found");
    return response;
  }

  async getAvailableExamPattern(exam: string, userId: string) {
    const response = await db
      .select({
        id: exam_patterns.id,
        title: exam_patterns.title,
        examname: exam_patterns.exam_name,
        difficulty: exam_patterns.difficulty,
        format: exam_patterns.format,
      })
      .from(exam_patterns)
      .where(
        and(
          eq(exam_patterns.exam_name, exam),
          eq(exam_patterns.created_by, userId),
        ),
      );

    if (response.length === 0) {
      throw new Error("Can not find any exampattern");
    }

    return response;
  }

  async deleteExamPattern(id: string) {
    const [usage] = await db
      .select({ id: exams.id })
      .from(exams)
      .where(eq(exams.exam_pattern_id, id));

    if (usage)
      throw new Error(
        "Cannot delete pattern: It is used in one or more Exams.",
      );

    const [response] = await db
      .delete(exam_patterns)
      .where(eq(exam_patterns.id, id))
      .returning();

    return response;
  }
}

export class ExamTimelineService {
  async getAllTimelines(examyearid: string) {
    return await db
      .select()
      .from(exam_timelines)
      .where(eq(exam_timelines.exam_year_id, examyearid))
      .orderBy(drizzleAsc(exam_timelines.date));
  }

  async getAllDistinctTimelines() {
    return await db
      .selectDistinctOn([exam_timelines.exam_year_id])
      .from(exam_timelines)
      .orderBy(exam_timelines.exam_year_id, drizzleAsc(exam_timelines.date));
  }

  async createTimeline(data: {
    title: string;
    date: Date | string;
    description?: string;
    status: any;
    notification?: string;
    exam_year: string;
  }) {
    const [created] = await db
      .insert(exam_timelines)
      .values({
        title: data.title,
        date: new Date(data.date),
        description: data.description,
        status: data.status,
        notification: data.notification,
        exam_year_id: data.exam_year,
        updated_at: new Date(),
      })
      .returning();
    return created;
  }

  async updateTimeline(
    id: string,
    data: {
      title?: string;
      date?: Date | string;
      description?: string;
      status?: any;
      notification?: string;
      exam_year?: string;
    },
  ) {
    const [updated] = await db
      .update(exam_timelines)
      .set({
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        exam_year_id: data.exam_year,
        updated_at: new Date(),
      })
      .where(eq(exam_timelines.id, id))
      .returning();
    return updated;
  }

  async deleteTimeline(id: string) {
    const [deleted] = await db
      .delete(exam_timelines)
      .where(eq(exam_timelines.id, id))
      .returning();
    return deleted;
  }
}

export class TargetExamService {
  async fetchTargetedExamById(id: string) {
    const [target_exam] = await db
      .select()
      .from(target_exams)
      .where(eq(target_exams.id, id));

    if (!target_exam) throw Error("Target exam not found");
    return target_exam;
  }

  async getAvailableTargetExam(category: string) {
    const response = await db
      .select({
        name: target_exams.name,
        shortCode: target_exams.short_code,
        id: target_exams.id,
      })
      .from(target_exams)
      .innerJoin(categories, eq(target_exams.category_id, categories.id))
      .where(eq(categories.name, category));

    if (response.length === 0) {
      throw new Error("Can not find any exam");
    }

    return response;
  }

  async createTargetedExam(data: any) {
    let categoryId: string | null = null;

    if (data.category) {
      const [categoryData] = await db
        .select()
        .from(categories)
        .where(eq(categories.name, data.category));
      if (!categoryData) throw Error("category not found");
      categoryId = categoryData.id;
    }

    let { category, ...rest } = data;
    const [target_exam] = await db
      .insert(target_exams)
      .values({
        ...rest,
        category_id: categoryId,
      })
      .returning();

    return target_exam;
  }

  async getAvailableTargetExamAll() {
    const response = await db
      .select({
        name: target_exams.name,
        shortCode: target_exams.short_code,
        id: target_exams.id,
      })
      .from(target_exams);

    if (response.length === 0) {
      throw new Error("Can not find any exam");
    }

    return response;
  }
}

export class TargetExamYearService {
  async createTargetedExamYear(data: any) {
    const [target_exam_data] = await db
      .select()
      .from(target_exams)
      .where(eq(target_exams.id, data.targetExamId));

    if (!target_exam_data)
      throw new Error("Invalid exam name — please select a valid exam");

    data.slug = ConvertInSlug(`${target_exam_data.short_code} ${data.year}`);

    const [target_exam_year] = await db
      .insert(exam_years)
      .values({
        ...data,
        target_exam_id: data.targetExamId,
        slug: data.slug,
        year: parseInt(data.year),
        updated_at: new Date(),
      })
      .returning();

    if (!target_exam_year) throw new Error("Failed to create target exam year");
    return target_exam_year;
  }

  async updateTargetedExamYear(data: any) {
    const [isTargetdExam_Year] = await db
      .select()
      .from(exam_years)
      .where(eq(exam_years.id, data.exam_year_id));

    if (!isTargetdExam_Year) {
      throw new Error("Invalid exam year ID");
    }

    const [updated_target_exam_year] = await db
      .update(exam_years)
      .set({
        ...(data.registrationOpenDate
          ? { registration_open_date: data.registrationOpenDate }
          : undefined),
        ...(data.registrationCloseDate
          ? { registration_close_date: data.registrationCloseDate }
          : undefined),
        ...(data.notes ? { notes: data.notes } : undefined),
        ...(data.status ? { status: data.status } : undefined),
        ...(data.slug ? { slug: data.slug } : undefined),
        updated_at: new Date(),
      })
      .where(eq(exam_years.id, data.exam_year_id))
      .returning();

    return updated_target_exam_year;
  }

  async getExamYearInfo(examname: string, id: string) {
    let exam_year;
    if (id) {
      const result = await db
        .select()
        .from(exam_years)
        .where(eq(exam_years.id, id));
      exam_year = result.length > 0 ? result[0] : null;
    } else {
      exam_year = await db
        .select({
          id: exam_years.id,
          targetExamId: exam_years.target_exam_id,
          year: exam_years.year,
          slug: exam_years.slug,
          status: exam_years.status,
          isPublic: exam_years.is_public,
          registrationOpenDate: exam_years.registration_open_date,
          registrationCloseDate: exam_years.registration_close_date,
          examDate: exam_years.exam_date,
          resultDate: exam_years.result_date,
          notes: exam_years.notes,
          createdAt: exam_years.created_at,
          updatedAt: exam_years.updated_at,
          isDeleted: exam_years.is_deleted,
        })
        .from(exam_years)
        .innerJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
        .where(eq(target_exams.short_code, examname));
    }

    if (!exam_year) throw Error("Exam year info not found");
    return exam_year;
  }
}
