import { logger } from "@/utils/logger.js";

export function waitForSomeThink(condition: () => boolean, timeout: number): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else {
        logger.debug("Condition not met, retrying...");

        setTimeout(check, timeout * 1000); // check again after 1 second
      }
    };
    check();
  });
}