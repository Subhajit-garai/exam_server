import prisma from "@repo/db/index.js";

async function seedLeaderboardEvent() {
    try {
        const existingEvent = await prisma.events.findFirst({
            where: {
                type: "ACTIVITY_LEADERBOARD_ARCHIVE",
            },
        });

        if (existingEvent) {
            console.log("ACTIVITY_LEADERBOARD_ARCHIVE event already exists.");
            return;
        }

        await prisma.events.create({
            data: {
                type: "ACTIVITY_LEADERBOARD_ARCHIVE",
                description: "Archive global leaderboard to Postgres daily",
                payload: {}, // No specific payload needed
                conditions: {},
                isActive: true,
                created_by: "Bot",
                runs: "DAILY",
                run_at: "23:59", // Run at end of day
            },
        });

        console.log("ACTIVITY_LEADERBOARD_ARCHIVE event created successfully.");
    } catch (error) {
        console.error("Error creating event:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedLeaderboardEvent();
