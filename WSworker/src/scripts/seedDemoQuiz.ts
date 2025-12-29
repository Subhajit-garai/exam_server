import { Redis } from "ioredis";


type quiz_question_type = {
    id: string,
    title: string,
    options: string[],
    ans: string[],
    explanation: string,
    format: string,
    extra: any
}

// Config (adjust if your redis is elsewhere)
const redis = new Redis({
    host: "localhost",
    port: 6379,
});

async function deleteKeysByPattern(pattern: string) {
    let cursor = "0";
    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
            await redis.del(keys);
            console.log(`Deleted ${keys.length} keys matching ${pattern}`);
        }
    } while (cursor !== "0");
}

async function seedQuiz(id: string, limit: number = 2) {
    console.log(`Seeding Quiz: ${id}`);

    // 1. Metadata
    const metadata = {
        id,
        total_questions: 5,
        nextQuestionTime: 60,
        quizOpenFor: 24,
        topics: ["Demo Topic"],
        subjects: ["Demo Subject"],
        limit: limit
    };

    await deleteKeysByPattern(`quiz:users:${id}`);
    await deleteKeysByPattern(`quizquestion:${id}:*`);
    await deleteKeysByPattern(`quizquestionans:${id}:*`);
    await deleteKeysByPattern(`quiz:data:${id}`);
    await deleteKeysByPattern(`quiz:shuffle:${id}:*`); // Clean up any old shuffle mapping keys if we decided to use them (though current deterministic approach doesn't use redis storage, it's safe to clear)
    await deleteKeysByPattern(`quiz:submissions:${id}:*`);
    await deleteKeysByPattern(`quiz:leaderboard:${id}`);
    await deleteKeysByPattern(`quiz:active_loop:${id}`);
    await deleteKeysByPattern(`quiz:startTime:${id}`);
    await deleteKeysByPattern(`quiz:question:startTime:${id}:*`);
    await deleteKeysByPattern(`quiz:question:endTime:${id}:*`);

    await redis.set(`quiz:data:${id}`, JSON.stringify(metadata));


    // 3. Questions (Add 5 dummy questions)
    for (let i = 1; i <= 2; i++) {


        const questionData = {
            number: i,
            part: 1,
            question: {
                id: `q${i}_${id}`,
                title: `Question ${i} for Quiz ${id}?`,
                options: [
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D"
                ],
                extra: {},
                format: "text",
                is_multiple_ans: false,
            }
        };
        // Important: Use the key structure expected by QuizManager: quizquestion:{quizId}:part1:{number}

        await redis.set(`quizquestion:${id}:part1:${i}`, JSON.stringify(questionData));
        await redis.set(`quizquestionans:${id}:part1:${i}`, "1");
    }

    console.log(`✅ Quiz ${id} ready with limit ${limit}`);
}

async function main() {
    // const ids = ["aaa", "bbb", "ccc", "ddd"];
    const ids = ["aaa"];
    for (const id of ids) {
        console.log("seedQuiz", id);

        await seedQuiz(id, 2); // Limit 2 for easy testing
    }
    process.exit(0);
}

main().catch(console.error);
