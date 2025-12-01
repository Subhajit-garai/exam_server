
import prisma from "@repo/db/index.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { QuizManager } from "../manager/quizManager.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const qm = QuizManager.getInstance();

// Run every minute
export const quizScheduler = async () => {
    try {
        console.log("Running quiz scheduler...");
        const now = dayjs().tz("Asia/Kolkata");
        const currentTimeString = now.format("hh:mm a"); // e.g., "02:30 pm"

        // Find quizzes that are scheduled for today and match current time (roughly)
        // Note: Storing time as string "hh:mm a" is tricky for exact matching.
        // Ideally, we should store full DateTime. 
        // Assuming `date` is the day and `starttime` is the time.

        const todayStart = now.startOf("day").toDate();
        const todayEnd = now.endOf("day").toDate();

        const quizzesToStart = await prisma.quiz.findMany({
            where: {
                stage: "Registration",
                date: {
                    gte: todayStart,
                    lte: todayEnd
                },
                starttime: currentTimeString // Exact match for now
            },
            select: {
                id: true
            }
        });

        for (const quiz of quizzesToStart) {
            console.log(`Starting scheduled quiz ${quiz.id}`);
            // Update stage to Started
            await prisma.quiz.update({
                where: { id: quiz.id },
                data: { stage: "Started" }
            });

            // Trigger start in Manager
            await qm.startQuiz(quiz.id);
        }

    } catch (error) {
        console.error("Error in quiz scheduler:", error);
    }

}
