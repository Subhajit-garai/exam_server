import { eventRuns, eventType, ExamStatus, UserRole, Visibility } from  "@repo/prisma/client";;
import prisma from  "@repo/db/index";
import { waitForSomeThink } from "@repo/lib/helper/delay";

type Syllabus = Awaited<ReturnType<typeof prisma.syllabus.findFirst>>;



export const createDpppattern = async (Syllabus: Syllabus, userid: string) => {
  let exam_patten_on_subject: string[] = [];
  if (!Syllabus) return;
  // Syllabus.topics.map(async (topic) => {
  //   const exam_pattern_subject_wise = await prisma.exam_pattern.create({
  //     data: {
  //       title: `JECA@PATTERN@${topic}`,
  //       format: "Text",
  //       examname: "JECA",
  //       category: "CS",
  //       syllabus: "Generic",
  //       topics: [`${topic}`],
  //       difficulty: "Easy",
  //       part: false,
  //       checkbox: false,
  //       part_Count: 1,
  //       total_questions: [15],
  //       check: "Normal",
  //       marks_values: [1],
  //       neg_values: [4],
  //       created_by: userid,
  //     },
  //   });

  //   if (exam_pattern_subject_wise) {
  //     console.log("exam pattern is created for ", topic);
  //     exam_patten_on_subject.push(exam_pattern_subject_wise.id);
  //   }
  // });

  // await waitForSomeThink(() => {
  //   if (Syllabus.topics.length === exam_patten_on_subject.length) return true;
  //   return false;
  // }, 3);
  console.log("exam_patten_on_subject----->", exam_patten_on_subject);

  let eventStatus = await prisma.events.create({
    data: {
      type: eventType.CREATE_DPP,
      description: "Create new dpp event",
      data: {
        time: ["4:00 am", "4:00 am"],
        count: 2,
        name: "autoincrement",
        examname: "JECA",
        category: "CS",
        Visibility: Visibility.Public,
        time_limit: "t+2",
        exam_pattern: exam_patten_on_subject,
        duration: "00:30",
        jointime: "20:00",
        difficulty: "Easy",
        examtype: "Dpp",
      },
      conditions: { when: "None" },
      created_by: UserRole.Bot,
      runs: eventRuns.DAILY,
      run_at: "04:00 am",
    },
  });

  console.log("event -----> ", eventStatus);
};