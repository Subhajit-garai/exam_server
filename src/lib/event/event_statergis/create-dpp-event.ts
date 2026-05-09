import { logger } from "@/utils/logger.js";
import { ExamManager } from "@/lib/manager/examManager.js";
import { db } from "@repo/db/index.js";
import { exams, exam_patterns } from "@repo/db/schema/exam.js";
import { users } from "@repo/db/schema/user.js";
import { contest_registers } from "@repo/db/schema/schema.js";
import { event_exam_data_type } from "@/lib/types/EventTypes.js";
import dayjs from "dayjs";
import { eq, and, gte, lt, desc, ilike } from "drizzle-orm";

import { BaseEvent, events } from "@subhajit60/event-engine";
import { type eventType } from "@repo/db/schema/enums.js";

export class create_dpp_event extends BaseEvent<eventType> {

    async push(event: events<eventType>): Promise<void> {
        logger.info("Running create_dpp_event with data:", event.payload);

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

            logger.info("---> creating new DPP");

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
                            eq(exams.exam_type, "Dpp"),
                            gte(exams.date, day.startOf("day").toDate()),
                            lt(exams.date, day.endOf("day").toDate())
                        ),
                        columns: {
                            id: true,
                        }
                    });

                    if (existingExams.length > 0) {
                        if (existingExams.length >= parseInt(count)) {
                            logger.info("DPP already exist for this date");
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
                    "all DPP creation done , no need to create new ones"
                );
            }

            let available_patterns: any[] = [];
            let predefined_subject = "Unknown";

            if (!exam_pattern_id) {
                available_patterns = await db.query.exam_patterns.findMany({
                    where: ilike(exam_patterns.title, "JECA@DPP@PATTERN%"),
                    columns: {
                        id: true,
                        title: true,
                    },
                });

                if (available_patterns.length === 0) {
                    throw new Error("Exam pattern not valid and given exampattern also not valid , add correct name ");
                }
            } else {
                const get_exam_patterns = await db.query.exam_patterns.findFirst({
                    where: eq(exam_patterns.id, exam_pattern_id),
                    columns: {
                        id: true,
                        title: true,
                    },
                });

                if (!get_exam_patterns) throw new Error("Exam pattern not found");

                let titleParts = get_exam_patterns.title?.split("@");

                if (titleParts && titleParts.length >= 4) {
                    predefined_subject = titleParts[3];
                }
            }

            let subjectCounters: Record<string, number> = {};

            for (let index = 0; index < create_exam_count_for_date.length; index++) {
                for (let idx = 0; idx < create_exam_count_for_date[index]; idx++) {
                    let current_exam_pattern_id = exam_pattern_id;
                    let subject = predefined_subject;

                    // If no specific pattern was requested, randomly pick one for THIS exam
                    if (!current_exam_pattern_id) {
                        let num = Math.floor(Math.random() * available_patterns.length);
                        current_exam_pattern_id = available_patterns[num].id;
                        let titleParts = available_patterns[num].title?.split("@");
                        if (titleParts && titleParts.length >= 4) {
                            subject = titleParts[3];
                        }
                    }

                    // Determine Name
                    let exam_name = "";
                    if (title === "autoincrement") {
                        if (subjectCounters[subject] === undefined) {
                            const lastExam = await db.query.exams.findFirst({
                                where: ilike(exams.name, `DPP@${subject}@%`),
                                orderBy: [desc(exams.created_at)],
                                columns: {
                                    name: true,
                                }
                            });
                            let new_exam_number_str = lastExam?.name?.split("@")[2];
                            subjectCounters[subject] = new_exam_number_str ? parseInt(new_exam_number_str as string) + 1 : 1;
                        } else {
                            subjectCounters[subject]++;
                        }
                        exam_name = `DPP@${subject}@${subjectCounters[subject]}`;
                    } else {
                        exam_name = "Unknown DPP";
                    }

                    const response = await db.transaction(async (tx) => {
                        const [register] = await tx.insert(contest_registers).values({
                            count: 0,
                            users: []
                        }).returning({ id: contest_registers.id });

                        const [newExam] = await tx.insert(exams).values({
                            name: exam_name,
                            visibility: Visibility as any,
                            exam_type: examtype as any,
                            start_time: starttime ? starttime[idx] : "08:00 am",
                            join_time: jointime ? jointime : "00:15 m",
                            duration: duration ? duration : "02:00 h",
                            date: dates[index],
                            exam_pattern_id: current_exam_pattern_id as string,
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
