import { CronJob } from "cron";
import prisma from "../../db/index.js";
import dayjs from "dayjs";

import { Client } from "pg";
import { MockSetProcessingStatus, ProcessMockSet } from "./Mockset.processing.js";
import { isFeatureAvailable } from "../../controllers/tier.controller.js";
import { webhook_type } from "../types/botTypes.js";
import axios from "axios";
import { timeToCron } from "./cronHelper.js";
import { events } from "../types/EventTypes.js";
import { eventRunner } from "./event/event-runner.js";

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
              if (event) scheduleJob(event);
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

// implements it in oops

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
    async () => {
      await eventRunner(event)
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

async function loadAndScheduleAllEvents() {
  try {
    console.log("Loading and scheduling all events...");

    const eventsFromDb = await prisma.events.findMany();

    for (const event of eventsFromDb) {
      if (scheduledJobs[event.id]) {
        scheduledJobs[event.id].stop(); // Stop old one if exists
      }
      if (event) scheduleJob(event);
    }

    console.log("All events loaded and scheduled.");
  } catch (error) {
    console.log("error in loadAndScheduleAllEvents ", error);
  }
}

loadAndScheduleAllEvents(); // Load and schedule all events on startup
