import { logger } from "@/utils/logger.js";

import { BaseEvent, events } from "@subhajit60/event-engine";
import { type eventType } from "@/db/enums.js";

export class send_notification_event extends BaseEvent<eventType> {
  async push(event: events<eventType>): Promise<void> {
    logger.info("Running send_notification_event with data:", event.payload);

    try {
      // here i push task in task queue
    } catch (error) {
      logger.info("error in task manager handleAns ", error);
    }
  }
}
