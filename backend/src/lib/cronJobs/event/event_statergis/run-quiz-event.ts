import { event_Quiz_data_type } from "@/lib/types/EventTypes";
import { BaseEvent } from "../bace-event";
import { QuizeSetupFunction } from "@/lib/helper/TelegramQuiz";

export class run_quiz_event extends BaseEvent {
  async push(): Promise<void> {
    console.log("Running run_quiz_event with data:", this.event.payload);

    try {
      // here i push task in task queue

      let {bot_user_id,} = this.event.payload as event_Quiz_data_type

      let user = bot_user_id;
      let notification = await QuizeSetupFunction(user, this.event.payload  as event_Quiz_data_type);
      if (notification) {
        console.log("Quiz created successfully");
      }
    } catch (error) {
      console.log("error in task manager handleAns ", error);
    }
  }
}
