import prisma from "@repo/db/index.js";

export class BotExamService {
    /**
     * Checks if an exam has all required questions added and updates its status.
     */
    async checkExamCompletionStatus(examid: string) {
        const examData = await prisma.exam.findFirst({
            where: { id: examid },
            select: {
                exam_pattern: { select: { total_questions: true } },
                creationstatus: true,
            },
        });

        if (!examData) throw new Error("Exam data not found");
        if (examData.creationstatus === "Done") throw new Error("Exam status already checked");

        // Verify question counts for each part
        await Promise.all(
            examData.exam_pattern.total_questions.map(async (expectedCount, idx) => {
                const actualCount = await prisma.question_map.count({
                    where: {
                        examid: examid,
                        part: `part${idx + 1}`,
                    },
                });

                if (actualCount !== expectedCount) {
                    throw new Error(
                        `Exam (${examid}) part${idx + 1} question count mismatch. Expected: ${expectedCount}, Found: ${actualCount}`
                    );
                }
            })
        );

        // Update status to Done
        return await prisma.exam.update({
            where: { id: examid },
            data: { creationstatus: "Done" },
            select: { id: true, name: true, creationstatus: true },
        });
    }

    // ### Question Logic
    async getQuestionsIds() {
        const topicNormalAnsQuestions = await prisma.$queryRawUnsafe(`SELECT old_topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = false AND status = 'Done' GROUP BY old_topic;`);
        const topicMultiplaAnsQuestions = await prisma.$queryRawUnsafe(`SELECT old_topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = true AND status = 'Done' GROUP BY old_topic;`);
        return { topicNormalAnsQuestions, topicMultiplaAnsQuestions };
    }

    async getQuestionsByIds(ids: string[]) {
        const questions = await prisma.questions.findMany({
            where: { id: { in: ids } },
            select: {
                ans: true,
                id: true,
                explanation: true,
                title: true,
                options: true,
                extra: true,
                format: true,
            },
        });
        if (!questions || questions.length === 0) throw new Error("Questions not found for given ids");
        return questions;
    }

    async getQuestionsForExam(examid: string) {
        const questionMapData = await prisma.question_map.findMany({
            where: { examid },
        });

        if (!questionMapData || questionMapData.length === 0) throw new Error("Given exam doesn't contain any questions");

        const questionIds = questionMapData.map((q) => q.questionid);

        const questions = await prisma.questions.findMany({
            where: { id: { in: questionIds } },
            select: {
                ans: true,
                id: true,
                explanation: true,
                title: true,
                options: true,
                extra: true,
                format: true,
            },
        });

        return questions;
    }

    async addQuestionsToExam(questions: any[]) {
        return await prisma.question_map.createMany({
            data: questions,
        });
    }

    // ### Exam Pattern Logic
    async getMockSetExamPattern(title: string) {
        const info = await prisma.exam_pattern.findFirst({
            where: { title },
            select: { topics: true },
        });
        if (!info) throw new Error("Exam pattern info not found");
        return info;
    }

    async getExamPatternId(examid: string) {
        const data = await prisma.exam.findFirst({
            where: { id: examid },
            select: { exam_pattern_id: true },
        });
        if (!data) throw new Error("Exam details not found");
        return data.exam_pattern_id;
    }

    async getExamPattern(exampatternid: string) {
        const pattern = await prisma.exam_pattern.findFirst({
            where: { id: exampatternid },
        });
        if (!pattern) throw new Error("Exam pattern details not found");
        return pattern;
    }

    async getExamDetails(examid: string) {
        const data = await prisma.exam.findFirst({
            where: { id: examid },
        });
        if (!data) throw new Error("Exam details not found");
        return data;
    }

    // ### Answer Logic
    async getExamAnswers(examid: string) {
        const questions = await prisma.question_map.findMany({
            where: { examid },
        });

        if (!questions || questions.length === 0) throw new Error("Exam invalid or doesn't have any ans");

        const questionIds = questions.map((item) => item.questionid);

        const questionData = await prisma.questions.findMany({
            where: { id: { in: questionIds } },
            select: { id: true, ans: true, topic_id: true },
        });

        if (!questionData) throw new Error("Question info not found");

        const questionDataMap = new Map(questionData.map((d) => [d.id, d]));

        const ans: any[] = [];
        questions.forEach((question) => {
            const que = questionDataMap.get(question.questionid);
            if (!que) throw new Error("Question info not match");
            ans.push({
                id: String(question.number),
                topic_id: que.topic_id,
                part: question.part,
                ans: que.ans,
            });
        });

        return ans;
    }
}
