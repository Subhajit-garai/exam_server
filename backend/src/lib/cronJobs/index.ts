import { CronJob } from "cron";
import prisma from "../../db/index";
import {
  Create_DPP_data_type,
  Create_Exam_conditions_type,
  Create_Exam_data_type,
  Create_Exam_type,
  Create_Telegram_Quiz_data_type,
  default_conditions_type,
  Clear_bot_cache_type,
  events,
  message_conditions,
  sendMessage_data,
} from "../types/EventTypes";
import {
  eventRuns,
  eventType,
  UserRole,
} from  "@repo/prisma/client"
import dayjs, { Dayjs } from "dayjs";
import { createDpp, createExam } from "./exam_create_cron";

import { Client } from "pg";
import { createQuiz } from "./telegram_bot_quiz_cron";
import { sendMessage } from "../messageService/telgramMessenger";
import { Questions_type } from "../types";
import { waitForSomeThink } from "../helper/delay";
import { debuglog } from "@repo/lib/helper/debugLog";
import { MockSetProcessingStatus, ProcessMockSet } from "./Mockset.processing";
import { isFeatureAvailable } from "src/controllers/tier.controller";
import { webhook_type } from "../types/botTypes";
import axios from "axios";

const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

// notification
pgClient.connect().then(async () => {
  console.log("PostgreSQL connected");

  pgClient.on("notification", async (msg: any) => {
    console.log("Notification received:", msg);

    const { id, action } = JSON.parse(msg.payload || "{}");

    try {
      switch (msg.channel) {
        case "event_channel":
          {
            console.log("Event channel notification received");
            console.log(`Event ${id} was ${action}`);
            const event = await prisma.events.findUnique({ where: { id } });
            if (event) {
              if (scheduledJobs[event.id]) {
                scheduledJobs[event.id].stop(); // Stop old one if exists
              }
              const parsed = await parseEvent(event);
              if (parsed) scheduleJob(parsed);
            }
          }
          break;

        case "mock_set_channel":
          {
            console.log("mock_set channel notification received");
            console.log(`Event ${id} was ${action}`);
            let status = await MockSetProcessingStatus(id);
            if (status && (status == "Updated" || status == "Created"))
              await ProcessMockSet(id, action);
          }
          break;

        case "prime_status_channel":
          {
            console.log("mock_set prime_status_channel notification received");
            console.log(`Event ${id} was ${action}`);

            let prime = await prisma.prime.findUnique({
              where: {
                id: id,
              },
            });
            if (!prime) throw new Error("Prime not found");
            let userData = await prisma.user.findFirst({
              where: {
                id: prime?.userid,
              },
              select: {
                telegram: {
                  select: {
                    telegramid: true,
                  },
                },
              },
            });

            if (!userData) throw new Error("userData not found");
            // telegram quiz
            let status = await isFeatureAvailable(prime?.status, "Quiz");
            if (!status) {
              throw new Error("Feature not available for user");
            } else {
              if (status.access) {
                // console.log("User has access to prime group service");
                // send message to user
                // let message = `You have been granted access to the prime group service. Enjoy your benefits!`;
                //  send webhook

                let bot_user = await prisma.user.findFirst({
                  where: {
                    role: "Bot",
                  },
                });
                let bot_webhook = await prisma.botInfo.findFirst({
                  where: {
                    botuser_id: bot_user?.id,
                  },
                });
                if (!bot_webhook) {
                  console.log("No bot webhook found");
                }

                let webhook: webhook_type =
                  bot_webhook?.webhook as webhook_type;
                let cbUrl = `${webhook.baseurl}${webhook.endpoint.survertask}`;

                let responce = await axios.post(cbUrl, {
                  type: "unbanuser",
                  user_id: userData?.telegram?.telegramid,
                });
                if (responce) {
                  console.log("User unbanned successfully");
                } else {
                  // setTimeout(() => {
                }
              }
            }
            // is user prime status include prime group service

            // send
          }
          break;

        default:
          console.log("Unknown channel", msg.channel);

          break;
      }
    } catch (error: any) {
      console.log("error ----->", error);
    }
  });

  await pgClient.query("LISTEN event_channel");
  await pgClient.query("LISTEN mock_set_channel");
  await pgClient.query("LISTEN prime_status_channel");
});



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
    let time = dayjs()
      .add(Math.floor(Math.random() * 10), "minute")
      .format("H:mm a");
    cronTime = timeToCron(time);
  } else {
    cronTime = timeToCron(event.run_at);
  }

  console.log("cronTime is ", cronTime, "event setup processing ....");

  const job = new CronJob(
    cronTime,
    async() => {
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
        case eventType.CLEAR_BOT_CACHE:
          {
            console.log("Clearing bot cache...");
            let bot_user = await prisma.user.findFirst({
              where: {
                role: "Bot",
              },
            });

            let bot_webhook = await prisma.botInfo.findFirst({
              where: {
                botuser_id: bot_user?.id,
              },
            });
            if (!bot_webhook) {
              console.log("No bot webhook found");
            }

            let webhook: webhook_type = bot_webhook?.webhook as webhook_type;
            let cbUrl = `${webhook.baseurl}${webhook.endpoint.survertask}`;
            try {
              let response = await axios.post(cbUrl, {
                type: "cleaupcache",
              });
              if (response.status === 200) {
                console.log("Bot cache cleared successfully");
              } else {
                console.error("Failed to clear bot cache", response.data);
              }
            } catch (error) {
              console.error("Error clearing bot cache:", error);
            }
          }
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
    // console.log(console.log(event?.data?.message));
  }
}

async function loadAndScheduleAllEvents() {
  try {
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
  } catch (error) {

    console.log("error in loadAndScheduleAllEvents " , error);
    
    
  }
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
      case eventType.CLEAR_BOT_CACHE:
        parsedEvent = {
          id: event.id,
          type: event.type, // Type assertion
          description: event.description,
          data: {}, // No data for this event type
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

// loadAndScheduleAllEvents(); // Load and schedule all events on startup



