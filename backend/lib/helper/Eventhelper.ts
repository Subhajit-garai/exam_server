// import { CronJob as cron } from "cron";
// import os from "os";
// import { eventType } from "@prisma/client";

// import prisma from "../../db";
// import { events } from "../types/EventTypes";

// // Function to get system load percentage
// const getSystemLoad = () => {
//   const load = os.loadavg()[0]; // 1-minute load average
//   const cpuCores = os.cpus().length;
//   return (load / cpuCores) * 100; // Convert to percentage
// };

// // Function to process different event types
// const processEvent = async (event:any) => {
//   try {

//     switch (event.type) {
//       case eventType.SEND_MESSAGE:
//         console.log(
//           `📩 Sending message to ${event.data.to}: "${event.data.message}"`
//         );
//         // Simulate sending a message (integrate Telegram, email, etc.)
//         break;

//     //   case eventType.CREATE_EXAM:
//     //     console.log(`📝 Creating an exam with ID: ${event.data.examId}`);
//     //     // Simulate exam creation logic here
//     //     break;

//       case eventType.NEW_QUIZ_RUN:
//         console.log(`🎯 Running quiz with ID: ${event.data.quizId}`);
//         // Simulate quiz execution logic
//         break;

//       default:
//         console.warn(`⚠️ Unknown event type: ${event.type}`);
//         return;
//     }

//     // Delete event after processing
//     await prisma.events.delete({ where: { id: event.id } });
//     console.log(`✅ Event ${event.id} processed and removed.`);
//   } catch (error) {
//     console.error(`❌ Error processing event ${event.id}:`, error);
//   }
// };

// // Function to fetch and process events
// const processEvents = async () => {
//   const systemLoad = getSystemLoad();

//   if (systemLoad > 50) {
//     console.log(
//       `⚠️ System load too high (${systemLoad.toFixed(
//         2
//       )}%). Skipping processing.`
//     );
//     return;
//   }

//   console.log("🔄 System load is optimal. Fetching pending events...");

//   // Fetch pending events, ordered by run time
//   const pendingEvents = await prisma.events.findMany({
//     where: {},
//     orderBy: { run_at: "asc" }, // Oldest first
//   });

//   if (pendingEvents.length === 0) {
//     console.log("✅ No pending events.");
//     return;
//   }

//   for (const event of pendingEvents) {
//     await processEvent(event);
//   }
// };

// // Schedule the cron job to run every minute
// cron.("* * * * *", processEvents);

// console.log("🚀 Cron job started: Checking events every minute.");
