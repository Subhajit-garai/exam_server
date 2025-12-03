import { events } from "@repo/prisma/client";
import { BaseEvent } from "../bace-event.js";
import { event_Quiz_data_type } from "@/lib/types/EventTypes.js";
import { run_webapp_quiz_event } from "../event_statergis/quiz/run-webapp-quiz-event.js";
import { run_telegram_quiz_event } from "../event_statergis/quiz/run-telegram-quiz-event.js";


export class QuizFactory {
  static create(event: events): BaseEvent {

    let { platform } = event.payload as event_Quiz_data_type
    switch (platform) {
      case "TELEGRAM":
        return new run_telegram_quiz_event(event);
      case "WEBAPP":
        return new run_webapp_quiz_event(event);
      default:
        throw new Error(`Unknown task type: ${event.type}`);
    }
  }
}
