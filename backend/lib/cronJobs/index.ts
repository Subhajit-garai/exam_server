import { CronJob } from "cron";
import prisma from "../../db/index";
import { examManager } from "../examManager";
import {
  Create_Exam_conditions_type,
  Create_Exam_data_type,
  Create_Exam_type,
  events,
  message_conditions,
  sendMessage_data,
} from "../types/EventTypes";
import { eventRuns, eventType, ExamStatus, UserRole } from "@prisma/client";
import dayjs from "dayjs";
import { createExam } from "./exam_create_cron";

let examConfig: events = {
  type: eventType.CREATE_EXAM,
  description: "Create new exam",
  data: {
    time: ["05:00 pm", "7:00 pm", "09:00 pm"],
    count: 3,
    name: "autoincrement",
    examname: "JECA",
    category: "CS",
    status: ExamStatus.Public,
    time_limit: "t+2",
    exam_pattern: "cm84qytmo000wbulk8tajumfv",
    duration: "02:00",
    difficulty: "Easy",
    examType: "Exam",
  },
  conditions: { when: "None" },
  created_by: UserRole.Bot,
  runs: eventRuns.DAILY,
  run_at: "02:00 am",
};

//end

const processJob = async () => {
  // db call and get event information
  // let datas = await prisma.events.findMany({})

  const event = await prisma.events.findFirst();
  // let parsedEvent: events = {} as events;
  let parsedEvent: events | null = null;
  if (!event) return;

  if (event) {
    switch (event.type) {
      case eventType.CREATE_EXAM:
        parsedEvent = {
          id: event.id,
          type: event.type, // Type assertion
          description: event.description,
          data: event.data as unknown as Create_Exam_data_type, // Convert JSON to TypeScript type
          conditions:
            event.conditions as unknown as Create_Exam_conditions_type,
          created_by: event.created_by as UserRole,
          runs: event.runs as eventRuns,
          run_at: event.run_at,
        };
        break;
      case eventType.SEND_MESSAGE:
        parsedEvent = {
          id: event.id,
          type: event.type, // Type assertion
          description: event.description,
          data: event.data as unknown as sendMessage_data, // Convert JSON to TypeScript type
          conditions: event.conditions as unknown as message_conditions,
          created_by: event.created_by as UserRole,
          runs: event.runs as eventRuns,
          run_at: event.run_at,
        };
        break;

      default:
        break;
    }
  }

  if (!parsedEvent) return;

  let events: events[] = [parsedEvent];

  events?.forEach((event) => {
    switch (event?.type) {
      case "CREATE_EXAM":
        createExam(event);
        break;

      default:
        break;
    }
  });
};
// const job = new CronJob("* * * * * *", processJob);
// Start the job
// job.start();

const every_10_seconds = "10 * * * * *";
const at_2_am = "0 2 * * *";
console.log("Cron job started for exam creation at 2:00 am");
const exam_create_job = new CronJob(
  at_2_am,
  () => {
    createExam(examConfig);
  },
  null,
  true, // Auto-start the job
  "Asia/Kolkata" // Timezone set to IST
);
exam_create_job.start();
