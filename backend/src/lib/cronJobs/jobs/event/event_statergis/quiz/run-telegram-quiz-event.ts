import { event_Quiz_data_type } from "@/lib/types/EventTypes.js";
import { BaseEvent } from "../../bace-event.js";
import { ExamManager } from "@/lib/manager/examManager.js";
import { logger } from "@/lib/helper/logger.js";

export class run_telegram_quiz_event extends BaseEvent {
  async push(): Promise<void> {
    console.log("Running run_telegram_quiz_event with data:", this.event.payload);

    try {
      const em = ExamManager.getInstance();

      let { chat_id, user_id, platform, chat_type } = this.event.payload as event_Quiz_data_type;

      const cburl = `${process.env.BOT_WEBHOOK_URL}/survertask`;
      let Notifystatus = await em.getRedisClient().push({
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

      if (Notifystatus) {
        logger.success("Quiz Created Successfully", "Quiz")
      }

    } catch (error) {
      console.log("error in task manager handleAns ", error);
    }
  }
}
