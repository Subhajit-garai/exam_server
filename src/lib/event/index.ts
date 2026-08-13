import { db } from "@/db/index.js";
import { events } from "@/db/schema/events.js";
import { eq } from "drizzle-orm";

import { Client } from "pg";
import { logger } from "@/utils/logger.js";
import { EventManager } from "@subhajit60/event-engine";
import { type eventType } from "@/db/schema/enums.js";
import { resetWeeklyLeaderboard } from "./jobs/activity.cron.js";
import { updateSystemStats, initSystemStats } from "./jobs/stats.cron.js";
import { create_dpp_event } from "./event_statergis/create-dpp-event.js";
import { create_exam_event } from "./event_statergis/create-exam-event.js";
import { send_notification_event } from "./event_statergis/send-notification-event.js";
import { run_telegram_quiz_event } from "./event_statergis/quiz/run-telegram-quiz-event.js";

const EVM = EventManager.getInstance<eventType>();

EVM.addDispatcherStrategy("CREATE_DPP", new create_dpp_event());
EVM.addDispatcherStrategy("CREATE_EXAM", new create_exam_event());
EVM.addDispatcherStrategy("SEND_MESSAGE", new send_notification_event());
EVM.addDispatcherStrategy("RUN_NEW_QUIZ", new run_telegram_quiz_event());

const pgClient = new Client({ connectionString: process.env.DATABASE_URL! });

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
            const event = await db.query.events.findFirst({
              where: eq(events.id, id),
            });
            if (event) {
              if (event.is_active) {
                EVM.scheduleJob(event);
              }
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
});

async function loadAndScheduleAllEvents() {
  try {
    logger.info("Loading and scheduling all events...");

    const eventsFromDb = await db.query.events.findMany({
      where: eq(events.is_active, true),
    });

    for (const event of eventsFromDb) {
      if (event) EVM.scheduleJob(event);
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
