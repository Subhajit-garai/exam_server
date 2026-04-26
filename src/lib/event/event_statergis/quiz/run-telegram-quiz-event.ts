import { event_Quiz_data_type } from "@/lib/types/EventTypes.js";
import { ExamManager } from "@/lib/manager/examManager.js";
import { logger } from "@/utils/logger.js";


import { BaseEvent, events } from "@subhajit60/event-engine";
import { type eventType } from "@repo/db/schema/enums.js";

export class run_telegram_quiz_event extends BaseEvent<eventType> {
  async push(event: events<eventType>): Promise<void> {
    logger.info("Running run_telegram_quiz_event with data:", event.payload);

    try {
      const em = ExamManager.getInstance();

      let { chat_id, user_id, platform, chat_type } = event.payload as event_Quiz_data_type;

      const cburl = `${process.env.BOT_WEBHOOK_URL}/survertask`;
      let Notifystatus = await em.getQueueManager().push({
        type: "SEND_QUIZ_DATA",
        id: String(chat_id),
        payload: {
          cburl: cburl,
          userid: user_id,
          chatid: chat_id,
          platfrom: platform,
          chat_type: chat_type,
        },
        variant: "Quiz",
        category: "JECA"
      });



    } catch (error) {
      logger.info("error in task manager handleAns ", error);
    }
  }
}
