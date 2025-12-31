import { BaseEvent } from "../bace-event.js";

export class send_notification_event extends BaseEvent {
  async push(): Promise<void> {
    console.log("Running send_notification_event with data:", this.event.payload);

    try {
      // here i push task in task queue

    } catch (error) {
      console.log("error in task manager handleAns ", error);
    }
  }
}
