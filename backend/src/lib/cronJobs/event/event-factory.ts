import { events } from "@/lib/types/EventTypes.js";
import { BaseEvent } from "./bace-event.js";
import { create_exam_event } from "./event_statergis/create-exam-event.js";
import { run_quiz_event } from "./event_statergis/run-quiz-event.js";
import { send_notification_event } from "./event_statergis/send-notification-event.js";
import { ActivityLeaderboardEvent } from "./event_statergis/activity-leaderboard-event.js";

export class EventFactory {
  static create(event: events): BaseEvent {
    switch (event.type) {
      case "CREATE_EXAM":
        return new create_exam_event(event);
      case "RUN_NEW_QUIZ":
        return new run_quiz_event(event);
      case "SEND_MESSAGE":
        return new send_notification_event(event);
      case "ACTIVITY_LEADERBOARD_ARCHIVE":
        return new ActivityLeaderboardEvent(event);
      default:
        throw new Error(`Unknown task type: ${event.type}`);
    }
  }
}
