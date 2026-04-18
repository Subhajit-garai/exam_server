import { logger } from "@repo/lib/helper/logger.js";
import dayjs from "dayjs";

export function timeToCron(timeStr: string, islog: boolean = false): string {
  // it converts the time string to cron format like "0 2 * * *" for 2:00 am

  const time = dayjs(timeStr, ["h:mm a"]);

  islog && logger.info("time is ", time.format("H:mm a"));

  const hour = time.format("H");
  const minute = time.format("m");
  return `${minute} ${hour} * * *`;
}

export function timeToCronWeekly(
  timeStr: string,
  islog: boolean = false
): string {
  // Input: "Monday 10:00 am"
  // Output: "0 10 * * 1" (minute hour * * dayOfWeek)

  const parts = timeStr.split(" ");
  // parts[0] = Day (Monday)
  // parts[1] = Time (10:00)
  // parts[2] = Period (am/pm)

  if (parts.length < 3) {
    throw new Error(
      "Invalid weekly time format. Expected 'Day Time am/pm', e.g., 'Monday 10:00 am'"
    );
  }

  const dayName = parts[0];
  const timeOnly = `${parts[1]} ${parts[2]}`;

  const time = dayjs(timeOnly, ["h:mm a"]);
  islog && logger.info("time is ", time.format("H:mm a"));

  const hour = time.format("H");
  const minute = time.format("m");

  // Map day name to cron day of week (0-6, Sunday is 0)
  const days: { [key: string]: number } = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const dayOfWeek = days[dayName];

  if (dayOfWeek === undefined) {
    throw new Error(`Invalid day name: ${dayName}`);
  }

  return `${minute} ${hour} * * ${dayOfWeek}`;
}

export function timeToCronMonthly(
  timeStr: string,
  islog: boolean = false
): string {
  // Input: "15 10:00 am" (15th of month)
  // Output: "0 10 15 * *" (minute hour dayOfMonth * *)

  const parts = timeStr.split(" ");
  // parts[0] = DayOfMonth (15)
  // parts[1] = Time (10:00)
  // parts[2] = Period (am/pm)

  if (parts.length < 3) {
    throw new Error(
      "Invalid monthly time format. Expected 'DayOfMonth Time am/pm', e.g., '15 10:00 am'"
    );
  }

  const dayOfMonth = parts[0];
  const timeOnly = `${parts[1]} ${parts[2]}`;

  const time = dayjs(timeOnly, ["h:mm a"]);
  islog && logger.info("time is ", time.format("H:mm a"));

  const hour = time.format("H");
  const minute = time.format("m");

  return `${minute} ${hour} ${dayOfMonth} * *`;
}
