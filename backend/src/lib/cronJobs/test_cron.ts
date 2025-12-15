import { timeToCronWeekly, timeToCronMonthly } from "./cronHelper";

try {
    console.log("Testing Weekly:");
    console.log("Monday 10:00 am ->", timeToCronWeekly("Monday 10:00 am"));
    console.log("Friday 02:30 pm ->", timeToCronWeekly("Friday 02:30 pm"));

    console.log("\nTesting Monthly:");
    console.log("15 10:00 am ->", timeToCronMonthly("15 10:00 am"));
    console.log("1 05:00 pm ->", timeToCronMonthly("1 05:00 pm"));

    console.log("\nTesting Errors:");
    try {
        timeToCronWeekly("Invalid 10:00 am");
    } catch (e: any) {
        console.log("Caught expected error for weekly:", e.message);
    }

} catch (e) {
    console.error(e);
}
