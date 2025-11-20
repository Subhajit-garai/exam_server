import dayjs from "dayjs";

export function timeToCron(timeStr: string, islog: boolean = false): string {
  // it converts the time string to cron format like "0 2 * * *" for 2:00 am

  const time = dayjs(timeStr, ["h:mm a"]);

  islog && console.log("time is ", time.format("H:mm a"));

  const hour = time.format("H");
  const minute = time.format("m");
  return `${minute} ${hour} * * *`;
}
