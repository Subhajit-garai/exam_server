import { CronJob } from "cron";
import prisma from "../../db/index.js";
import dayjs from "dayjs";

import { Client } from "pg";
import {
  timeToCron,
  timeToCronWeekly,
  timeToCronMonthly,
} from "./cronHelper.js";
import { events } from "../types/EventTypes.js";
import { eventRunner } from "./jobs/event/event-runner.js";
import { resetWeeklyLeaderboard } from "./jobs/activity.cron.js";
import { updateSystemStats, initSystemStats } from "./jobs/stats.cron.js";
import { logger } from "../helper/logger.js";

const pgClient = new Client({ connectionString: process.env.DATABASE_URL });

// notification
pgClient.connect().then(async () => {
  logger.info("PostgreSQL connected");

  pgClient.on("notification", async (msg: any) => {
    logger.info("Notification received:", msg);

    const { id, action } = JSON.parse(msg.payload || "{}");

    try {
      switch (msg.channel) {
        case "event_channel":
          {
            logger.info("Event channel notification received");
            logger.info(`Event ${id} was ${action}`);
            const event = await prisma.events.findUnique({ where: { id } });
            if (event) {
              if (scheduledJobs[event.id]) {
                scheduledJobs[event.id].stop(); // Stop old one if exists
              }
              if (event.isActive) scheduleJob(event);
            }
          }
          break;
        default:
          logger.info("Unknown channel", msg.channel);

          break;
      }
    } catch (error: any) {
      logger.info("error ----->", error);
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
  } else if (event.runs === "WEEKLY") {
    cronTime = timeToCronWeekly(event.run_at);
  } else if (event.runs === "MONTHLY") {
    cronTime = timeToCronMonthly(event.run_at);
  } else {
    cronTime = timeToCron(event.run_at);
  }


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
  logger.success("job added into scheduledJobs ", event.id, "event type is ", event.type, "Time is ", event.run_at);
  job.start();
}

async function loadAndScheduleAllEvents() {
  try {
    logger.info("Loading and scheduling all events...");

    const eventsFromDb = await prisma.events.findMany({
      where: {
        isActive: true,
      },
    });

    for (const event of eventsFromDb) {
      if (scheduledJobs[event.id]) {
        scheduledJobs[event.id].stop(); // Stop old one if exists
      }
      if (event) scheduleJob(event);
    }

    logger.success("All events loaded and scheduled.");
  } catch (error) {
    logger.error("error in loadAndScheduleAllEvents ", error);
  }
}



loadAndScheduleAllEvents(); // Load and schedule all events on startup
resetWeeklyLeaderboard.start();
updateSystemStats.start();
initSystemStats();

