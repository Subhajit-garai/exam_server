import { logger } from "@/utils/logger.js";
import { ExamManager } from "@/lib/manager/examManager.js";
import { db } from "@repo/db/index.js";
import { exams, exam_patterns } from "@repo/db/schema/exam.js";
import { users } from "@repo/db/schema/user.js";
import { contest_registers } from "@repo/db/schema/schema.js";
import { event_exam_data_type } from "@/lib/types/EventTypes.js";
import dayjs from "dayjs";
import { eq, and, gte, lt, desc, ilike, sql } from "drizzle-orm";


import { BaseEvent, events } from "@subhajit60/event-engine";
import { type eventType } from "@repo/db/schema/enums.js";

export class create_exam_event extends BaseEvent<eventType> {

  async push(event: events<eventType>): Promise<void> {
    logger.info("Running create_exam_event with data:", event.payload);

    try {
      // here i push task in task queue
      let {
        time_limit,
        count,
        title,
        exam_pattern: exam_pattern_id_val,
        duration,
        starttime,
        jointime,
        examname,
        Visibility,
        category,
        examtype,
        gap,
      } = event.payload as event_exam_data_type;

      let exam_pattern_id = exam_pattern_id_val;

      let new_exam_names: string[][] = [];
      let new_exam_number;
      let create_exam_count_for_date: number[] = [];
      let dates: Date[] = [];
      const em = ExamManager.getInstance();

      logger.info("---> creating new exam");

      const lastExam = await db.query.exams.findFirst({
        where: ilike(exams.name, 'Test@%'),
        orderBy: [desc(exams.created_at)],
        columns: {
          name: true,
          created_at: true,
          created_by: true,
        }
      });

      const botUser = await db.query.users.findFirst({
        where: eq(users.email, "bot1@exambuddys.in"),
        columns: {
          id: true,
        }
      });

      if (time_limit) {
        let days_count = 0;
        if (time_limit == "t") {
          days_count = 1;
        } else {
          days_count = parseInt(time_limit.split("+")[1]) + 1;
        }

        let gap_days = 1;
        if (gap) {
          gap_days = parseInt(gap.split(' ')[0]);
        }

        for (let index = 0; index < days_count; index++) {
          let processing_day = index * gap_days;
          logger.info("processing_day: ", processing_day);

          let day = dayjs().add(processing_day, "day");
          logger.info("day: ", day.format("DD-MM-YYYY"));

          const existingExams = await db.query.exams.findMany({
            where: and(
              eq(exams.created_by, botUser?.id as string),
              eq(exams.exam_type, "Test"),
              gte(exams.date, day.startOf("day").toDate()),
              lt(exams.date, day.endOf("day").toDate())
            ),
            columns: {
              id: true,
            }
          });

          if (existingExams.length > 0) {
            if (existingExams.length >= parseInt(count)) {
              logger.info("Exam already exist for this date");
            } else {
              let dif = parseInt(count) - existingExams.length;
              create_exam_count_for_date.push(dif);
              dates.push(day.toDate());
            }
          } else {
            create_exam_count_for_date.push(parseInt(count));
            dates.push(day.toDate());
          }
        }
      }

      if (!create_exam_count_for_date.length) {
        return logger.info(
          "all exam creation done , no need to create new ones"
        );
      }

      if (title === "autoincrement") {
        let new_exam_number_str = lastExam?.name?.split("@")[1];
        if (!new_exam_number_str) {
          new_exam_number_str = "0";
        }
        new_exam_number = parseInt(new_exam_number_str as string) + 1;
        for (
          let index = 0;
          index < create_exam_count_for_date.length;
          index++
        ) {
          let temp_name_array: string[] = [];
          for (let idx = 0; idx < create_exam_count_for_date[index]; idx++) {
            temp_name_array.push(`Test@${new_exam_number}`);
            new_exam_number++;
          }
          new_exam_names.push(temp_name_array);
        }
      }

      if (exam_pattern_id) {
        const patternValid = await db.query.exam_patterns.findFirst({
          where: eq(exam_patterns.id, exam_pattern_id),
          columns: { id: true }
        });

        if (!patternValid) {
          logger.info("invalid exam_pattern id");
          const jecaPattern = await db.query.exam_patterns.findFirst({
            where: eq(exam_patterns.title, "JECA@PATTERN"),
            columns: { id: true }
          });

          if (jecaPattern) {
            exam_pattern_id = jecaPattern.id;
          } else {
            throw new Error(
              "Exam pattern not valid and given exampattern also not valid , add correct name "
            );
          }
        }
      }

      for (let index = 0; index < create_exam_count_for_date.length; index++) {
        for (let idx = 0; idx < create_exam_count_for_date[index]; idx++) {
          const response = await db.transaction(async (tx) => {
            const [register] = await tx.insert(contest_registers).values({
              count: 0,
              users: []
            }).returning({ id: contest_registers.id });

            const [newExam] = await tx.insert(exams).values({
              name: new_exam_names[index][idx],
              visibility: Visibility as any,
              exam_type: examtype as any,
              start_time: starttime ? starttime[idx] : "08:00 am",
              join_time: jointime ? jointime : "00:15 m",
              duration: duration ? duration : "02:00 h",
              date: dates[index],
              exam_pattern_id: exam_pattern_id as string,
              created_by: botUser?.id,
              register_id: register.id
            }).returning();

            return newExam;
          });

          let { id } = response;
          await em.getQueueManager().push({
            type: "CREATE_EXAM",
            id: id,
            payload: {
              examid: id,
              userid: botUser?.id as string,
              examtype: response.exam_type,
            },
            category: "JECA",
            variant: response.exam_type as any,
          });
        }
      }
    } catch (error) {
      logger.error("error in task manager handleAns ", error);
    }
  }
}
