
import { UserService } from "../src/services/user.service.js";
import prisma from "../src/db/index.js";

async function main() {
    console.log("Starting timeline verification...");

    const email = `test_timeline_${Date.now()}@example.com`;
    console.log(`Creating test user: ${email}`);

    let user;
    let targetExam;
    let examYear;

    try {
        // 1. Create Target Exam and Exam Year
        targetExam = await prisma.targetExam.create({
            data: {
                name: `Test Exam ${Date.now()}`,
                shortCode: `TE${Date.now()}`,
            }
        });

        examYear = await prisma.examYear.create({
            data: {
                targetExamId: targetExam.id,
                year: 2025,
                slug: `test-exam-2025-${Date.now()}`,
            }
        });

        console.log(`Exam Year created: ${examYear.id}`);

        // 2. Create User linked to Exam Year
        user = await prisma.user.create({
            data: {
                name: "Test Timeline User",
                email: email,
                password: "password123",
                role: "User",
                exam_year_id: examYear.id, // Linking to the ExamYear ID
                targeted_exam_id: targetExam.id
            }
        });
        console.log(`User created: ${user.id}`);

        // 3. Create Timeline Events
        await prisma.examTimeline.create({
            data: {
                title: "Registration Starts",
                date: new Date("2025-01-01"),
                status: "SCHEDULED",
                exam_year: examYear.id
            }
        });

        await prisma.examTimeline.create({
            data: {
                title: "Exam Date",
                date: new Date("2025-05-01"),
                status: "SCHEDULED",
                exam_year: examYear.id
            }
        });

        console.log("Timeline events created.");

        // 4. Verify getUserTimeline
        const userService = new UserService();
        console.log("Fetching user timeline...");
        const timeline = await userService.getUserTimeline(user.id);
        console.log("Timeline fetched:", timeline);

        if (timeline.length !== 2) {
            throw new Error(`Expected 2 timeline events, got ${timeline.length}`);
        }

        if (timeline[0].title !== "Registration Starts" && timeline[1].title !== "Registration Starts") {
            throw new Error("Expected 'Registration Starts' event not found");
        }

        console.log("Verification SUCCESS!");

    } catch (error) {
        console.error("Verification FAILED:", error);
        process.exit(1);
    } finally {
        // Cleanup
        if (user) await prisma.user.delete({ where: { id: user.id } });
        if (examYear) await prisma.examYear.delete({ where: { id: examYear.id } });
        if (targetExam) await prisma.targetExam.delete({ where: { id: targetExam.id } });
        await prisma.$disconnect();
    }
}

main();
