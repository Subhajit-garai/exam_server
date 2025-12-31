import { Redis } from "ioredis";

// Config
const redis = new Redis({
    host: "localhost",
    port: 6379,
});

async function checkRedis(quizId: string) {
    console.log(`Checking Redis for Quiz: ${quizId}`);

    // 1. Check Users
    const users = await redis.smembers(`quiz:users:${quizId}`);
    console.log(`Users in quiz (quiz:users:${quizId}):`, users);

    // 2. Check Leaderboard
    const leaderboard = await redis.zrange(`quiz:leaderboard:${quizId}`, 0, -1, "WITHSCORES");
    console.log(`Leaderboard (quiz:leaderboard:${quizId}):`, leaderboard);

    // 3. Check Question 1 Answer
    const q1Ans = await redis.get(`quizquestionans:${quizId}:part1:1`);
    console.log(`Q1 Answer (quizquestionans:${quizId}:part1:1):`, q1Ans);

    // 4. Check Question 1 Data
    const q1Data = await redis.get(`quizquestion:${quizId}:part1:1`);
    console.log(`Q1 Data (quizquestion:${quizId}:part1:1):`, q1Data);

    // 5. Check Submissions (for a user if exists)
    if (users.length > 0) {
        const userId = users[0];
        const submissions = await redis.hgetall(`quiz:submissions:${quizId}:${userId}`);
        console.log(`Submissions for ${userId} (quiz:submissions:${quizId}:${userId}):`, submissions);
    }

    process.exit(0);
}

checkRedis("aaa").catch(console.error);
