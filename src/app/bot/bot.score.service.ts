import { db, schema } from "@/db/index.js";
import { eq, and, sql, count } from "drizzle-orm";

export class BotScoreService {
    /**
     * Updates user progress based on the exam type.
     */
    async updateUserProgress(userId: string, examId: string) {
        // 1. Fetch Exam Logic
        const examResult = await db.select({ exam_type: schema.exams.exam_type })
            .from(schema.exams)
            .where(eq(schema.exams.id, examId))
            .limit(1);

        const exam = examResult[0];
        if (!exam) return;

        // 2. Fetch Score to calculate correctness
        const scoreEntryResult = await db.select({ result: schema.scores.result })
            .from(schema.scores)
            .where(
                and(
                    eq(schema.scores.exam_id, examId),
                    eq(schema.scores.user_id, userId)
                )
            )
            .limit(1);

        const scoreEntry = scoreEntryResult[0];

        let right = 0;
        let wrong = 0;
        if (scoreEntry?.result) {
            const result = scoreEntry.result as any;
            Object.keys(result).forEach((key) => {
                right += result[key].Right || 0;
                wrong += result[key].Wrong || 0;
            });
        }
        const totalAttemptedInThisExam = right + wrong;

        // 3. Update Specific Progress

        switch (exam.exam_type) {
            case "Dpp": {
                await db.insert(schema.dpp_progress)
                    .values({
                        user_id: userId,
                        solved_count: 1,
                        questions_solved: right,
                        last_dpp_id: examId,
                        last_dpp_date: new Date(),
                        current_streak: 0
                    })
                    .onConflictDoUpdate({
                        target: schema.dpp_progress.user_id,
                        set: {
                            solved_count: sql`${schema.dpp_progress.solved_count} + 1`,
                            questions_solved: sql`${schema.dpp_progress.questions_solved} + ${right}`,
                            last_dpp_id: examId,
                            last_dpp_date: new Date()
                        }
                    });
            }
                break;
            case "Quiz": {
                await db.insert(schema.quiz_progress)
                    .values({
                        user_id: userId,
                        attended: 1,
                        total_score: right * 4,
                        last_quiz_id: examId,
                        last_quiz_date: new Date()
                    })
                    .onConflictDoUpdate({
                        target: schema.quiz_progress.user_id,
                        set: {
                            attended: sql`${schema.quiz_progress.attended} + 1`,
                            total_score: sql`${schema.quiz_progress.total_score} + ${right * 4}`,
                            last_quiz_id: examId,
                            last_quiz_date: new Date()
                        }
                    });

            }

                break;

            default: {
                const updatedProgressRes = await db.insert(schema.exam_progress)
                    .values({
                        user_id: userId,
                        attended: 1,
                        total_correct: right,
                        total_questions_attempted: totalAttemptedInThisExam,
                        last_exam_id: examId,
                        last_exam_date: new Date(),
                        accuracy: 0,
                        last_rank: 0,
                        best_rank: 0
                    })
                    .onConflictDoUpdate({
                        target: schema.exam_progress.user_id,
                        set: {
                            attended: sql`${schema.exam_progress.attended} + 1`,
                            total_correct: sql`${schema.exam_progress.total_correct} + ${right}`,
                            total_questions_attempted: sql`${schema.exam_progress.total_questions_attempted} + ${totalAttemptedInThisExam}`,
                            last_exam_id: examId,
                            last_exam_date: new Date()
                        }
                    })
                    .returning();

                const updatedProgress = updatedProgressRes[0];

                // Recalculate accuracy
                if (updatedProgress.total_questions_attempted > 0) {
                    const newAccuracy = Math.floor((updatedProgress.total_correct / updatedProgress.total_questions_attempted) * 100);
                    await db.update(schema.exam_progress)
                        .set({ accuracy: newAccuracy })
                        .where(eq(schema.exam_progress.user_id, userId));
                }
            }
                break;
        }


    }


    async setUserScore(examid: string, userid: string, scoreData: any) {
        const existingScoreResult = await db.select({ id: schema.scores.id })
            .from(schema.scores)
            .where(
                and(
                    eq(schema.scores.exam_id, examid),
                    eq(schema.scores.user_id, userid)
                )
            )
            .limit(1);

        if (existingScoreResult.length > 0) throw new Error("User score already present");

        const scoreRes = await db.insert(schema.scores)
            .values({
                user_id: userid,
                exam_id: examid,
                score: scoreData.score,
                total_questions: scoreData.total_questions,
                not_attempt: scoreData.not_attempt,
                result: scoreData.result,
                topic_wise_result: scoreData.topic_wise_result,
                time: new Date()
            })
            .returning();

        if (!scoreRes[0]) throw new Error("Error while adding user score");
        return scoreRes[0];
    }

    async getUserScore(examid: string, userid: string) {
        const res = await db.select()
            .from(schema.scores)
            .where(
                and(
                    eq(schema.scores.exam_id, examid),
                    eq(schema.scores.user_id, userid)
                )
            )
            .limit(1);
        return res[0];
    }

    async setUserAnswer(data: any) {
        const { userid, examid, questionid, shuffleMap, selectedOption, number, part } = data;

        const isAnsExistResult = await db.select({ id: schema.user_answers.id })
            .from(schema.user_answers)
            .where(
                and(
                    eq(schema.user_answers.exam_id, examid),
                    eq(schema.user_answers.user_id, userid),
                    eq(schema.user_answers.question_id, questionid)
                )
            )
            .limit(1);

        if (isAnsExistResult.length > 0) {
            const updateRes = await db.update(schema.user_answers)
                .set({ selected_option: selectedOption })
                .where(
                    and(
                        eq(schema.user_answers.exam_id, examid),
                        eq(schema.user_answers.user_id, userid),
                        eq(schema.user_answers.question_id, questionid)
                    )
                )
                .returning();
            return updateRes[0];
        } else {
            const insertRes = await db.insert(schema.user_answers)
                .values({
                    selected_option: selectedOption,
                    exam_id: examid,
                    user_id: userid,
                    question_id: questionid,
                    shuffle_map: shuffleMap,
                    number: number || 0,
                    part: part || "part1"
                })
                .returning();
            return insertRes[0];
        }
    }

    async getUserAnswer(userid: string, examid: string) {
        const userAnsRes = await db.select()
            .from(schema.user_answers)
            .where(
                and(
                    eq(schema.user_answers.exam_id, examid),
                    eq(schema.user_answers.user_id, userid)
                )
            )
            .limit(1);

        if (userAnsRes.length === 0) throw new Error("User ans not exists");
        return userAnsRes[0];
    }
}
