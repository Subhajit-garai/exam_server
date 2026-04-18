import { logger } from "@repo/lib/helper/logger.js";
import { BaseEvent } from "../../bace-event.js";
import { QuizManager } from "@/lib/manager/quizManager.js";
import { event_Quiz_data_type } from "@/lib/types/EventTypes.js";

export class run_webapp_quiz_event extends BaseEvent {
    async push(): Promise<void> {
        logger.info("Running run_webapp_quiz_event with data:", this.event.payload);

        try {
            const payload = this.event.payload as event_Quiz_data_type;
            // Assuming payload contains quizId. 
            // The scheduler passes the quiz object or id.
            // Let's check what the scheduler will pass.

            // const quizId = payload.quizId || payload.id;

            // if (!quizId) {
            //     throw new Error("Quiz ID is missing in payload");
            // }

            // const qm = QuizManager.getInstance();
            // await qm.startQuiz(quizId);

            // logger.info(`Webapp Quiz ${quizId} started successfully via event.`);

        } catch (error) {
            logger.error("Error in run_webapp_quiz_event:", error);
        }
    }
}
