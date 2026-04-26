import { BaseWorkerTask } from "../base-task.js";
import { logger } from "@/utils/logger.js";
import { QueueManager } from "@/lib/queue/queueManager.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { LeaderboardManager } from "@/lib/manager/leaderboardManager.js";

export class QuizAnsTask extends BaseWorkerTask {
    private queueManager = QueueManager.getInstance();
    private redis = RedisManager.getInstance().getclient();
    private leaderboardManager = LeaderboardManager.getInstance();

    async execute(): Promise<void> {
        const { quizId, userId, userans, number, isMultiple, timestamp } = this.task.payload;

        try {
            // 1. Get Question Info
            const questionStr = await this.redis.get(`quizquestion:${quizId}:part1:${number}`);
            if (!questionStr) {
                logger.error(`[QUIZ_ANS_TASK] Question not found: ${quizId}, ${number}`);
                return;
            }
            const question = JSON.parse(questionStr);

            // 2. Calculate Score
            let score = 0;
            if (isMultiple) {
                const correctAnswers = question.question.ans.split(",");
                score = userans.filter((a: string) => correctAnswers.includes(a)).length;
            } else {
                // For single choice, we use the map to find the real answer
                const correctAnsIndex = question.question.map[parseInt(userans[0]) - 1];
                score = String(correctAnsIndex) === String(question.question.ans) ? 1 : 0;
            }

            // 3. Store Submission
            const submissionData = {
                questionId: question.question.id,
                questionNumber: number,
                userAnswer: userans,
                score,
                timestamp,
            };

            await this.redis.hset(`quiz:submissions:${quizId}:${userId}`, number.toString(), JSON.stringify(submissionData));
            await this.redis.expire(`quiz:submissions:${quizId}:${userId}`, 86400);

            // 4. Update Leaderboard
            await this.leaderboardManager.updateLeaderboard(quizId, userId, score);

            // 5. Broadcast Updated Leaderboard (handled by QuizManager's throttled broadcast or directly here)
            // For real-time quizes, we broadcast the update
            const leaderboard = await this.leaderboardManager.getLeaderBoard(quizId);
            const message = {
                type: "QUIZ_LEADERBOARD",
                payload: { leaderboard },
                rooms: [quizId]
            };
            await this.redis.publish("WS_BROADCAST", JSON.stringify(message));

            logger.info(`[QUIZ_ANS_TASK] Processed answer for user ${userId} in quiz ${quizId}. Score: ${score}`);

        } catch (error) {
            logger.error(`[QUIZ_ANS_TASK] Error processing answer:`, error);
            throw error; // Re-throw for BullMQ retry
        }
    }
}
