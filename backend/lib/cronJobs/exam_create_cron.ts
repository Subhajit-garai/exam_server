import { eventType } from "@prisma/client";
import prisma from "../../db/index";
import { examManager } from "../examManager";
import { Create_Exam_type, events } from "../types/EventTypes";
import dayjs from "dayjs";

const em = examManager.getInstance()
export const createExam = async (event: events) => {


   // clear examManger cache

   em.ClearCache_exmaManager();


   console.log("examManager cache cleared");
   
  if (event.type == eventType.CREATE_EXAM) {
    let new_exam_names: string[][] = [];
    let new_exam_number;
    let create_exam_count_for_date: number[] = [];
    let dates: Date[] = [];
    const em = examManager.getInstance();

    console.log("---> creating new exam");

    let lastExam = await prisma.exam.findFirst({
      where: {
        name: {
          startsWith: "Exam@",
        },
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        name: true,
        created_at: true,
        created_by: true,
      },
      take: 1,
    });

    let user = await prisma.user.findFirst({
      where: {
        email: "bot1@exambuddys.in",
      },
      select: {
        id: true,
      },
    });

    // console.log("user: ", user);

    if (event.data.time_limit) {
      let days_count = 0;
      if (event.data.time_limit == "t") {
        days_count = 1;
      }
      days_count = parseInt(event.data.time_limit.split("+")[1]) + 1;
      console.log("days", days_count);

      for (let index = 0; index < days_count; index++) {
        // console.log("loop running", index);

        let day = dayjs().add(index, "day");
        // console.log("day", day.toDate());

        let isExamExaist = await prisma.exam.findMany({
          where: {
            created_by: user?.id,
            date: {
              gte: day.startOf("day").toDate(), // Start of the day (00:00:00)
              lt: day.endOf("day").toDate(), // End of the day (23:59:59)
            },
          },
          select: {
            id: true,
          },
        });

        // console.log("isExamExaist", isExamExaist);
        // console.log("isExamExaist length", isExamExaist.length);

        if (isExamExaist.length > 0) {
          // some exam has already been created
          if (isExamExaist.length >= event.data.count) {
            console.log("Exam already exist for this date");
            // console.log("count", isExamExaist.flat());
          } else {
            // some exam has already  created so reduced exam creaction number

            // console.log("hit");

            let dif = event.data.count - isExamExaist.length;

            create_exam_count_for_date.push(dif);
            dates.push(day.toDate());
          }
        } else {
          // no exam exists for this date create  new ones
          // console.log(" no exam exists for this date create  new ones",day.toDate());

          create_exam_count_for_date.push(event.data.count);
          dates.push(day.toDate());
        }
      }
    }
    if (!create_exam_count_for_date.length) {
      return console.log("all exam creation done , no need to create new ones");
    }
    if (event.data.name === "autoincrement") {
      let new_exam_number_str = lastExam?.name?.split("@")[1];
      if (!new_exam_number_str) {
        new_exam_number_str = "0";
      }
      new_exam_number = parseInt(new_exam_number_str as string) + 1;
      for (let index = 0; index < create_exam_count_for_date.length; index++) {
        let temp_name_array: string[] = [];
        for (let idx = 0; idx < create_exam_count_for_date[index]; idx++) {
          temp_name_array.push(`Exam@${new_exam_number}`);
          new_exam_number++;
        }
        new_exam_names.push(temp_name_array);
      }
    }

    // console.log("create_exam_count_for_date: ", create_exam_count_for_date);
    // console.log("dates: ", dates);
    // console.log("names: ", new_exam_names);

    // create exam in database is ok , create 3 exam for a date  now it create one a day

    if (event.data.exam_pattern) {
      let is_exam_pattern_id_valid = await prisma.exam_pattern.findFirst({
        where: {
          id: event.data.exam_pattern,
        },
        select: {
          id: true,
        },
      });

      if (!is_exam_pattern_id_valid) {
        console.log("invalid exam_pattern id");
        let get_exam_pattern_id = await prisma.exam_pattern.findFirst({
          where: {
            title: "JECA@PATTERN",
          },
          select: {
            id: true,
          },
        });

        if (get_exam_pattern_id) {
          event.data.exam_pattern = get_exam_pattern_id.id;
        } else {
          throw new Error(
            "Exam pattern not valid and given exampattern also not valid , add correct name "
          );
        }
      }
    }

    let { duration, time, jointime } = event.data;
    for (let index = 0; index < create_exam_count_for_date.length; index++) {
      for (let idx = 0; idx < create_exam_count_for_date[index]; idx++) {
        let response = await prisma.exam.create({
          data: {
            name: new_exam_names[index][idx],
            examname: event.data?.examname,
            status: event.data.status,
            category: event.data.category,
            starttime: time ? time[idx] : "08:00 pm",
            jointime: jointime ? jointime : "00:15 m",
            duration: duration ? duration : "02:00 h",
            date: dates[index],
            questions: {},
            exam_pattern: {
              connect: { id: event.data.exam_pattern },
            },
            User: {
              connect: { id: user?.id }, // createdby
            },
            AnsSheet: {
              create: {
                ans: {},
              },
            },
          },
        });

        //   // send it into queue to process question
        let { id } = response;
        let Notifystatus = await em.getredisclient().push({
          type: "CreateExam",
          examid: id,
          userid: user?.id as string,
        });
      }
    }
  }

 
};
