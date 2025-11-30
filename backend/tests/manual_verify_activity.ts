
import { ActivityService } from "../src/services/activity.service.js";
import prisma from "../src/db/index.js";
import { ActivityType } from "@repo/prisma/enums.js";

async function main() {
    console.log("Starting verification...");

    // 1. Create a dummy user
    const email = `test_activity_${Date.now()}@example.com`;
    console.log(`Creating test user: ${email}`);

    let user;
    try {
        user = await prisma.user.create({
            data: {
                name: "Test Activity User",
                email: email,
                password: "password123", // dummy
                role: "User"
            }
        });
        console.log(`User created: ${user.id}`);

        // 2. Create Activity
        const service = new ActivityService();
        const activityData = {
            title: "Test Quiz",
            type: ActivityType.QUIZ,
            score: "10/10",
            status: "Completed"
        };

        console.log("Creating activity...");
        const activity = await service.createActivity(user.id, activityData);
        console.log("Activity created:", activity);

        if (activity.type !== "QUIZ") {
            throw new Error(`Expected type QUIZ, got ${activity.type}`);
        }
        if ((activity.meta as any).title !== "Test Quiz") {
            throw new Error(`Expected title Test Quiz, got ${(activity.meta as any).title}`);
        }

        // 3. Get Activities
        console.log("Fetching activities...");
        const activities = await service.getRecentActivities(user.id);
        console.log("Activities fetched:", activities);

        if (activities.length !== 1) {
            throw new Error(`Expected 1 activity, got ${activities.length}`);
        }
        if (activities[0].title !== "Test Quiz") {
            throw new Error(`Expected fetched title Test Quiz, got ${activities[0].title}`);
        }
        if (activities[0].activityType !== ActivityType.QUIZ) {
            // Logic check: originalType was "QUIZ", so it should be "QUIZ" if we use meta.originalType
            // But wait, in createRecentActivity:
            // meta: { originalType: data.activityType } -> "QUIZ"
            // getRecentActivities: activityType: meta.originalType || activity.type.toLowerCase()
            // So it should be "QUIZ".
        }

        console.log("Verification SUCCESS!");

    } catch (error) {
        console.error("Verification FAILED:", error);
        process.exit(1);
    } finally {
        // Cleanup
        if (user) {
            console.log("Cleaning up user...");
            await prisma.user.delete({ where: { id: user.id } });
        }
        await prisma.$disconnect();
    }
}

main();
