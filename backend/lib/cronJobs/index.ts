import { CronJob } from "cron";
import prisma from "../../db/index";
import { examManager } from "../examManager";
import {
  Create_DPP_data_type,
  Create_Exam_conditions_type,
  Create_Exam_data_type,
  Create_Exam_type,
  Create_Telegram_Quiz_data_type,
  default_conditions_type,
  events,
  message_conditions,
  sendMessage_data,
} from "../types/EventTypes";
import { eventRuns, eventType, ExamStatus, UserRole } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import { createDpp, createExam } from "./exam_create_cron";

import { Client } from "pg";
import { createQuiz } from "./telegram_bot_quiz_cron";
import { sendMessage } from "../messageService/telgramMessenger";

const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

// notification
pgClient.connect().then(async () => {
  console.log("PostgreSQL connected");

  pgClient.on("notification", async (msg: any) => {
    const { id, action } = JSON.parse(msg.payload || "{}");
    console.log(`Event ${id} was ${action}`);
    const event = await prisma.events.findUnique({ where: { id } });
    if (event) {
      if (scheduledJobs[event.id]) {
        scheduledJobs[event.id].stop(); // Stop old one if exists
      }
      const parsed = await parseEvent(event);
      if (parsed) scheduleJob(parsed);
    }
  });

  await pgClient.query("LISTEN event_channel");
});

// this is an event , because it is used to create exam , like daily event which run at 2:00 am and create exams
let examConfig2: events = {
  id: 'cmaqyyiu7001bbu048z465gj3',
  type: 'CREATE_DPP',
  description: 'Create new exam',
  data: {
    name: 'autoincrement',
    time: [ '4:00 am', '4:00 am' ],
    count: 2,
    status: 'Public',
    category: 'CS',
    duration: '00:30',
    examname: 'JECA',
    examtype: 'Dpp',
    jointime: '20:00',
    difficulty: 'Easy',
    time_limit: 't+2',
    exam_pattern: [
      'cmaqyygig000mbu04j5gwxzn6',
      'cmaqyygix000ubu04h4ctbwyh',
      'cmaqyygix000sbu04lvt4k8yt',
      'cmaqyygix000vbu04szaehvco',
      'cmaqyygiz000xbu04oy4z3zj2',
      'cmaqyygix000tbu04cx661lhw',
      'cmaqyygj0000zbu040xtb9tio'
    ]
  },
  conditions: { when: 'None' },
  created_by: 'Bot',
  runs: 'DAILY',
  run_at: '10:10 pm'
}
let examConfig: events = {
  type: eventType.CREATE_EXAM,
  description: "Create new exam",
  data: {
    time: ["7:00 pm", "09:00 pm"],
    count: 2,
    name: "autoincrement",
    examname: "JECA",
    category: "CS",
    status: ExamStatus.Public,
    time_limit: "t+2",
    exam_pattern: "cm9g0rw7w0013bunssgpo31sh",
    duration: "02:00",
    jointime: "02:00",
    difficulty: "Easy",
    examtype: "Exam",
  },
  conditions: { when: "None" },
  created_by: UserRole.Bot,
  runs: eventRuns.DAILY,
  run_at: "02:00 am",
};

//end
// it converts the time string to cron format like "0 2 * * *" for 2:00 am
function timeToCron(timeStr: string): string {  
  const time = dayjs(timeStr, ["h:mm a"]);

  // console.log("time is ", time.format("H:mm a"));

  const hour = time.format("H");
  const minute = time.format("m");
  return `${minute} ${hour} * * *`;
}

export type scheduledJob_type = {
  [key: string]: CronJob;
};

const scheduledJobs: scheduledJob_type = {};

function scheduleJob(event: events) {
  let cronTime;
  if (event.run_at == "Any") {
    let time  =  dayjs().add(Math.floor(Math.random()*10),'minute').format("H:mm a")
    cronTime = timeToCron(time)    
  } else {
    cronTime = timeToCron(event.run_at);
  }

  console.log("cronTime is ", cronTime, "event setup processing ....");

  const job = new CronJob(
    cronTime,
    () => {
      console.log(`Running scheduled task: ${event.description}`);
      switch (event.type) {
        case eventType.CREATE_EXAM:
          createExam(event);
          break;
        case eventType.CREATE_DPP:
          createDpp(event);
          break;
        case eventType.SEND_MESSAGE:
          // Add SEND_MESSAGE logic if needed
          sendMessageWithtelegram(event);
          break;
        case eventType.RUN_NEW_QUIZ:
          // Add NEW_QUIZ_RUN logic if needed
          createQuiz(event);
          break;
        default:
          console.log("Unknown event type, no action taken.");
        // Add SEND_MESSAGE logic if needed
      }
    },
    null,
    true,
    "Asia/Kolkata"
  );
  if (!event.id) return;
  scheduledJobs[event.id] = job;
  console.log("job added into scheduledJobs ", event.id);
  console.log("job startting...");

  job.start();
}

async function sendMessageWithtelegram(event: events) {
  if (event.type == "SEND_MESSAGE") {
    console.log(console.log(event?.data?.message));
  }
}

async function loadAndScheduleAllEvents() {
  console.log("Loading and scheduling all events...");

  const eventsFromDb = await prisma.events.findMany();

  for (const event of eventsFromDb) {
    if (scheduledJobs[event.id]) {
      scheduledJobs[event.id].stop(); // Stop old one if exists
    }

    const parsedEvent = await parseEvent(event); // Use your switch-case
    if (parsedEvent) scheduleJob(parsedEvent);
  }

  console.log("All events loaded and scheduled.");
}

const parseEvent = async (event: any) => {
  let parsedEvent: events | null = null;
  if (!event) return;
  // console.log("event data is ", event);

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
      case eventType.CREATE_DPP:
        parsedEvent = {
          id: event.id,
          type: event.type, // Type assertion
          description: event.description,
          data: event.data as unknown as Create_DPP_data_type, // Convert JSON to TypeScript type
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
      case eventType.RUN_NEW_QUIZ:
        parsedEvent = {
          id: event.id,
          type: event.type, // Type assertion
          description: event.description,
          data: event.data as unknown as Create_Telegram_Quiz_data_type, // Convert JSON to TypeScript type
          conditions: event.conditions as unknown as default_conditions_type,
          created_by: event.created_by as UserRole,
          runs: event.runs as eventRuns,
          run_at: event.run_at,
        };
        break;

      default:
        break;
    }
  }

  if (!parsedEvent) return null;
  return parsedEvent;
};

loadAndScheduleAllEvents(); // Load and schedule all events on startup

// const every_10_seconds = "5 * * * * *";
// const at_2_am = "0 2 * * *";
// console.log("Cron job started for exam creation at 2:00 am");
// const exam_create_job = new CronJob(
//   every_10_seconds,
//   () => {
//     createDpp(examConfig2);
//   },
//   null,
//   true, // Auto-start the job
//   "Asia/Kolkata" // Timezone set to IST
// );
// exam_create_job.start();
