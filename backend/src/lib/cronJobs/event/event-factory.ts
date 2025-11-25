import { events } from "@/lib/types/EventTypes";
import { BaseEvent } from "./bace-event";
import { create_exam_event } from "./event_statergis/create-exam-event";
import { run_quiz_event } from "./event_statergis/run-quiz-event";
import { send_notification_event } from "./event_statergis/send-notification-event";

export class EventFactory {
  static create(event: events): BaseEvent {
    switch (event.type) {
      case "CREATE_EXAM":
        return new create_exam_event(event);
      case "RUN_NEW_QUIZ":
        return new run_quiz_event(event);
      case "SEND_MESSAGE":
        return new send_notification_event(event);
      default:
        throw new Error(`Unknown task type: ${event.type}`);
    }
  }
}
