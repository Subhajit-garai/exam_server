import "dotenv/config";
import { ActivityLeaderboardService } from "../src/services/activity/activity.leaderboard.service.js";
import { ActivityStreakService } from "../src/services/activity/activity.streak.service.js";

async function verifyLeaderboards() {
    const leaderboardService = new ActivityLeaderboardService();
    const streakService = new ActivityStreakService();

    console.log("Verifying Leaderboards...");

    const userId1 = "user_test_1";
    const userId2 = "user_test_2";

    // 1. Test XP Leaderboard
    console.log("Testing XP Leaderboard...");
    await leaderboardService.updateXPLeaderboard(userId1, 100);
    await leaderboardService.updateXPLeaderboard(userId2, 200);

    const xpLeaderboard = await leaderboardService.getXPLeaderboard('weekly');
    console.log("XP Leaderboard:", JSON.stringify(xpLeaderboard, null, 2));

    if (xpLeaderboard.length >= 2 && xpLeaderboard[0].score === 200) {
        console.log("XP Leaderboard OK");
    } else {
        console.error("XP Leaderboard FAILED");
    }

    // 2. Test Quiz Leaderboard
    console.log("Testing Quiz Leaderboard...");
    await leaderboardService.updateQuizLeaderboard(userId1, 50);
    await leaderboardService.updateQuizLeaderboard(userId2, 80);

    const quizLeaderboard = await leaderboardService.getQuizLeaderboard('weekly');
    console.log("Quiz Leaderboard:", JSON.stringify(quizLeaderboard, null, 2));

    if (quizLeaderboard.length >= 2 && quizLeaderboard[0].score === 80) {
        console.log("Quiz Leaderboard OK");
    } else {
        console.error("Quiz Leaderboard FAILED");
    }

    // 3. Test Streak Leaderboard
    console.log("Testing Streak Leaderboard...");
    // Mocking streak update via service (which calls leaderboard update)
    // Note: This requires DB access for userStreak, which might fail if users don't exist in DB.
    // So we'll test the leaderboard service method directly for streak.
    await leaderboardService.updateStreakLeaderboard(userId1, 5);
    await leaderboardService.updateStreakLeaderboard(userId2, 10);

    const streakLeaderboard = await leaderboardService.getStreakLeaderboard();
    console.log("Streak Leaderboard:", JSON.stringify(streakLeaderboard, null, 2));

    if (streakLeaderboard.length >= 2 && streakLeaderboard[0].score === 10) {
        console.log("Streak Leaderboard OK");
    } else {
        console.error("Streak Leaderboard FAILED");
    }
}

verifyLeaderboards().catch(console.error).finally(() => process.exit());
