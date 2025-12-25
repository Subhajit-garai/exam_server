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

    async getSyllabusDataForExamCreattion(syllabusid: string) {
        if (!syllabusid) throw new Error("Syllabus ID not received");

        const syllabusData = await prisma.syllabus.findFirst({
            where: { id: syllabusid },
            select: {
                SubjectSyllabusMap: {
                    select: {
                        subject: { select: { shortName: true } },
                    },
                },
            },
        });

        if (!syllabusData) throw new Error("Syllabus data not found");

        const syllabus = syllabusData.SubjectSyllabusMap.map((item) => item.subject.shortName);
        return syllabus;
    }

    async getQuestionDetailsforProcessing(data: any) {
        const where: any = {};

        // Handle array input (legacy/simple ids)
        if (Array.isArray(data)) {
            where.id = { in: data };
        } else {
            // Handle object input
            if (data.id) where.id = data.id;
            if (data.ids) where.id = { in: data.ids };

            // if (data.subject_id) {
            //     where.subject_id = data.subject_id;
            //     where.status = "Processing";
            // }
            // if (data.topic_id) {
            //     where.topic_id = data.topic_id;
            //     where.status = "Processing";
            // }
            if (data.old_topic) {
                where.old_topic = data.old_topic;
                // where.status = "Done";
            }
            if (data.old_sub_topic) {
                where.old_sub_topic = data.old_sub_topic;
                where.status = "Done";
            }
        }

        if (Object.keys(where).length === 0) {
            throw new Error("No valid filters provided");
        }

        let take = data?.limit ? data?.limit : 1
        let skip = data?.skip ? data?.skip : 0

        console.log(" log filer where state --> ", where, take, skip);

        let questionData = await prisma.question.findMany({
            where: {
                old_topic: where.old_topic
            }
            ,
            take: take,
            skip: skip
        });

        let isAlreadyInProcessing = await prisma.questionProcessing.findMany({
            where: where
        })

        let finalSelectedQuestion: any[] = []

        if (isAlreadyInProcessing && isAlreadyInProcessing.length !== 0) {

            // remove  which are in questionProcessing tabel 
            questionData.map((question) => {
                isAlreadyInProcessing.map((item) => {
                    if (question.id !== item.question_id) {
                        finalSelectedQuestion.push(question)
                    }
                })

            })
        } else {
            console.log("empty isAlreadyInProcessing data ");
            finalSelectedQuestion = questionData
        }

        console.log("    finalSelectedQuestion data ----> ", finalSelectedQuestion);

        if (!finalSelectedQuestion || finalSelectedQuestion.length === 0) throw new Error("Questions not found");
        return finalSelectedQuestion;
    }


    async AddProcessingQuestions(data: any[]) {
        if (!data || data.length === 0) return [];

        const result = await prisma.questionProcessing.createMany({
            data: data.map((item) => ({
                title: item.title,
                options: item.options,
                ans: item.ans,
                format: item.format || "Text",
                category: item.category,
                topic_id: item.topic_id,
                subject_id: item.subject_id,
                difficulty: item.difficulty,
                is_multiple_ans: item.is_multiple_ans || false,
                explanation: item.explanation,
                links: item.links || [],
                extra: item.extra || undefined,
                status: item.status,
                old_topic: item.old_topic,
                old_sub_topic: item.old_sub_topic,
                created_at: item.created_at,
                created_by: item.created_by, // Ensure this is passed in data
                processing_status: "Pending",
            })),
            skipDuplicates: true,
        });

        return result;
    }

    async getQuestionDetailsForBot(ids: string[]) {
        const questionData = await prisma.question.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                title: true,
                topic_id: true,
                difficulty: true,
                subject_id: true,
                explanation: true,
                is_multiple_ans: true,
                status: true,
            },
        });

        if (!questionData || questionData.length === 0) throw new Error("Questions not found or invalid IDs");
        return questionData;
    }

    // ### Question Logic
    async getQuestionsIds() {
        const topicNormalAnsQuestions = await prisma.$queryRawUnsafe(`SELECT  s.name AS subject_name, ARRAY_AGG(q.id) AS ids FROM "Question" q JOIN "Subject" s ON q.subject_id = s.id  WHERE is_multiple_ans = false AND status = 'Done' GROUP BY s.name;`);
        const topicMultiplaAnsQuestions = await prisma.$queryRawUnsafe(`SELECT  s.name AS subject_name, ARRAY_AGG(q.id) AS ids FROM "Question" q JOIN "Subject" s ON q.subject_id = s.id  WHERE is_multiple_ans = true AND status = 'Done' GROUP BY s.name;`);
        return { topicNormalAnsQuestions, topicMultiplaAnsQuestions };
    }

    async getQuestionsByIds(ids: string[]) {

        const questions = await prisma.question.findMany({
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

        const questions = await prisma.question.findMany({
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

        const questionData = await prisma.question.findMany({
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
