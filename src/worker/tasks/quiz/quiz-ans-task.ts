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
            const correctAnsArray = Array.isArray(question.question.ans) 
                ? question.question.ans 
                : String(question.question.ans).split(",");
            
            const isMultipleAns = question.question.is_multiple_ans ?? isMultiple;

            if (isMultipleAns) {
                // Map user answers (shuffled indices) back to original indices
                const mappedUserAns = userans.map((ans: string) => {
                    const idx = parseInt(ans) - 1;
                    return String(question.question.map[idx]);
                });
                
                // For multiple choice, we check how many of the mapped answers are in the correct answers
                // OR we check if the entire set matches. 
                // Given the user said "calculate wrong", let's make it 1 point for the whole question if all are correct
                const isCorrect = mappedUserAns.length === correctAnsArray.length && 
                                 mappedUserAns.every((a: string) => correctAnsArray.includes(a));
                score = isCorrect ? 1 : 0;
            } else {
                // For single choice, we use the map to find the real answer
                const userAnsIndex = parseInt(userans[0]) - 1;
                if (!isNaN(userAnsIndex) && question.question.map[userAnsIndex]) {
                    const correctAnsIndex = question.question.map[userAnsIndex];
                    score = correctAnsArray.includes(String(correctAnsIndex)) ? 1 : 0;
                }
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

            // 5. Broadcast Updated Leaderboard
            const leaderboard = await this.leaderboardManager.getLeaderBoard(quizId);
            const message = {
                type: "QUIZ_LEADERBOARD",
                payload: { leaderboard },
                rooms: [quizId]
            };
            await this.redis.publish("WS_BROADCAST", JSON.stringify(message));

            logger.info(`[QUIZ_ANS_TASK] Processed answer for user ${userId} in quiz ${quizId}. Score: ${score}. Correct: ${correctAnsArray}`);

        } catch (error) {
            logger.error(`[QUIZ_ANS_TASK] Error processing answer:`, error);
            throw error; // Re-throw for BullMQ retry
        }
    }
}
