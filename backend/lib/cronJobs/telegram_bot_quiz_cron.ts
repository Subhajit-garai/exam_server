import { eventType } from "@prisma/client";
import { QuizeSetupFunction } from "../helper/TelegramQuiz";
import { events } from "../types/EventTypes";

export const createQuiz = async (event: events) => {
  try {
    if (event.type == eventType.RUN_NEW_QUIZ) {
      let user = event.data.bot_user_id;
      let notification = await QuizeSetupFunction(user, event.data);
      if (notification) {
        console.log("Quiz created successfully");
      }
    }
  } catch (error) {
    console.log("Quiz creation failed", error);
    // set notification to failed
  }
};
