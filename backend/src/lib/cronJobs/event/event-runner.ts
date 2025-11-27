import { events } from "@/lib/types/EventTypes.js";

import { logger } from "@/lib/helper/logger.js";
import { BaseEvent } from "./bace-event.js";
import { EventFactory } from "./event-factory.js";

export async function eventRunner(event: events) {
  let name: string = "NoEvent";
  let instance: BaseEvent | null = null;

  // STEP 1: CREATE EVENT INSTANCE
  try {
    instance = EventFactory.create(event);
    name = instance.constructor.name; // ✔ correct class name
  } catch (err) {
    logger.error(`[Work Scheduler] Failed to create event instance for type: ${event.type}`, err);
    return; // stop here; cannot continue
  }

  // STEP 2: RUN THE EVENT
  try {
    logger.info(`[Work Scheduler] Starting event ${name} (${event.id})`);
    const start = Date.now();
    await instance.run();
    const time = Date.now() - start;
    logger.success(`[Work Scheduler] Completed ${name} in ${time}ms`);
  } catch (err) {
    logger.error(`[Work Scheduler] Task ${name} failed:`, err);
  }

}
