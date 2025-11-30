import { ActivityService } from "../src/services/activity.service.js";
import prisma from "@repo/db/index.js";
import { ActivityType } from "@repo/prisma/enums.js";

async function main() {
    console.log("Starting Activity Engine Test (v2)...");

    const service = new ActivityService();

    // 1. Get Daily Challenge (should cache)
    console.log("\n1. Testing getDailyChallenge...");
    const challenge = await service.getDailyChallenge();
    console.log("Daily Challenge:", challenge);

    // 2. Create a test user
    console.log("\n2. Creating test user...");
    const user = await prisma.user.create({
        data: {
            name: "Test User Premium",
            email: `test_prem_${Date.now()}@example.com`,
            password: "password123",
        },
    });
    console.log("Created User:", user.id);

    // 3. Set User as Gold Member
    console.log("\n3. Setting User as Gold Member...");
    await prisma.prime.create({
        data: {
            userid: user.id,
            status: "Gold"
        }
    });

    // 4. Complete Activity (Check XP Multiplier)
    console.log("\n4. Completing Activity (Base XP: 100)...");
    const result = await service.completeActivity({
        userId: user.id,
        activityType: ActivityType.DAILY_CHALLENGE,
        xpEarned: 100,
        metadata: { challengeId: challenge.id },
    });
    console.log("Activity Result:", result);

    if (result.xpEarned === 150) {
        console.log("SUCCESS: XP Multiplier applied correctly (100 * 1.5 = 150)");
    } else {
        console.error(`FAILURE: XP Multiplier failed. Expected 150, got ${result.xpEarned}`);
    }

    // 5. Check Stats
    console.log("\n5. Checking User Stats...");
    const stats = await service.getUserStats(user.id);
    console.log("User Stats:", stats);

    // Clean up
    console.log("\nCleaning up...");
    await prisma.prime.delete({ where: { userid: user.id } });
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
