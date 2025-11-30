import { ActivityType } from "@repo/prisma/enums.js";
import { ActivityService } from "../src/services/activity.service.js";
import prisma from "@repo/db/index.js";


async function main() {
    console.log("Starting Activity Engine Test...");

    const service = new ActivityService();

    // 1. Get Daily Challenge
    console.log("\n1. Testing getDailyChallenge...");
    const challenge = await service.getDailyChallenge();
    console.log("Daily Challenge:", challenge);

    // 2. Create a test user
    console.log("\n2. Creating test user...");
    const user = await prisma.user.create({
        data: {
            name: "Test User",
            email: `test_${Date.now()}@example.com`,
            password: "password123",
        },
    });
    console.log("Created User:", user.id);

    // 3. Complete Activity
    console.log("\n3. Completing Activity...");
    const result = await service.completeActivity({
        userId: user.id,
        activityType: ActivityType.DAILY_CHALLENGE,
        xpEarned: 50,
        metadata: { challengeId: challenge.id },
    });
    console.log("Activity Result:", result);

    // 4. Check Stats
    console.log("\n4. Checking User Stats...");
    const stats = await service.getUserStats(user.id);
    console.log("User Stats:", stats);

    // 5. Check Leaderboard
    console.log("\n5. Checking Leaderboard...");
    const leaderboard = await service.getLeaderboard('global');
    console.log("Global Leaderboard:", leaderboard);

    // Clean up
    console.log("\nCleaning up...");
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
