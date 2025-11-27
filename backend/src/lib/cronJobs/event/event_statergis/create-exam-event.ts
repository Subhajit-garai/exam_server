import { examManager } from "@/lib/manager/examManager.js";
import { BaseEvent } from "../bace-event.js";
import prisma from "@/db/index.js";
import { event_exam_data_type } from "@/lib/types/EventTypes.js";
import dayjs from "dayjs";

export class create_exam_event extends BaseEvent {
  async push(): Promise<void> {
    console.log("Running create_exam_event with data:", this.event.payload);

    try {
      // here i push task in task queue
      let {
        time_limit,
        count,
        title,
        exam_pattern,
        duration,
        starttime,
        jointime,
        examname,
        Visibility,
        category,
        examtype,
      } = this.event.payload as event_exam_data_type;
      // here data in today

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

      if (time_limit) {
        let days_count = 0;
        if (time_limit == "t") {
          days_count = 1;
        } else {
          days_count = parseInt(time_limit.split("+")[1]) + 1;
        }

        for (let index = 0; index < days_count; index++) {
          let day = dayjs().add(index, "day");


          let isExamExaist = await prisma.exam.findMany({
            where: {
              created_by: user?.id,
              examtype: "Test",
              date: {
                gte: day.startOf("day").toDate(), // Start of the day (00:00:00)
                lt: day.endOf("day").toDate(), // End of the day (23:59:59)
              },
            },
            select: {
              id: true,
            },
          });


          console.log("----> exams -> ", isExamExaist);



          if (isExamExaist.length > 0) {
            // some exam has already been created
            if (isExamExaist.length >= parseInt(count)) {
              console.log("Exam already exist for this date");
            } else {
              // some exam has already  created so reduced exam creaction number
              let dif = parseInt(count) - isExamExaist.length;
              create_exam_count_for_date.push(dif);
              dates.push(day.toDate());
            }
          } else {
            // no exam exists for this date create  new ones
            create_exam_count_for_date.push(parseInt(count));
            dates.push(day.toDate());
          }


        }

      }


      if (!create_exam_count_for_date.length) {
        return console.log(
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
            temp_name_array.push(`Exam@${new_exam_number}`);
            new_exam_number++;
          }
          new_exam_names.push(temp_name_array);
        }
      }

      if (exam_pattern) {
        let is_exam_pattern_id_valid = await prisma.exam_pattern.findFirst({
          where: {
            id: exam_pattern,
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
            exam_pattern = get_exam_pattern_id.id;
          } else {
            throw new Error(
              "Exam pattern not valid and given exampattern also not valid , add correct name "
            );
          }
        }
      }

      for (let index = 0; index < create_exam_count_for_date.length; index++) {
        for (let idx = 0; idx < create_exam_count_for_date[index]; idx++) {
          let response = await prisma.exam.create({
            data: {
              name: new_exam_names[index][idx],
              examname: examname,
              Visibility: Visibility,
              category: category,
              examtype: examtype,
              starttime: starttime ? starttime[idx] : "08:00 am",
              jointime: jointime ? jointime : "00:15 m",
              duration: duration ? duration : "02:00 h",
              date: dates[index],
              // questions: {},
              exam_pattern: {
                connect: { id: exam_pattern },
              },
              User: {
                connect: { id: user?.id }, // createdby
              },
              ContestRegister: {
                create: {},
              },
            },
          });

          //   // send it into queue to process question
          let { id } = response;
          let Notifystatus = await em.getredisclient().push({
            type: "CREATE_EXAM",
            id: id,
            payload: {
              examid: id,
              userid: user?.id as string,
              examtype: response.examtype,
            },
            category: "JECA",
            variant: response.examtype,
          });
        }
      }
    } catch (error) {
      console.log("error in task manager handleAns ", error);
    }
  }
}
