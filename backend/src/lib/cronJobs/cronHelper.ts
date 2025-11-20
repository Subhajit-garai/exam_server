import dayjs from "dayjs";

export function timeToCron(timeStr: string, islog:boolean = false): string {
  const time = dayjs(timeStr, ["h:mm a"]);

  islog && console.log("time is ", time.format("H:mm a"));

  const hour = time.format("H");
  const minute = time.format("m");
  return `${minute} ${hour} * * *`;
}
