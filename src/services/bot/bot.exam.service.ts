
import { db, schema } from "@/db/index.js";
import { QuestionsId } from "@/worker/lib/ExamQuestionProcessor.js";
import { eq, and, inArray, count, sql } from "drizzle-orm";

export class BotExamService {
    /**
     * Checks if an exam has all required questions added and updates its status.
     */




    async setMockQuestionSetStatus(mockid: string, status: schema.CreationTypes) {

        const res = await db.select({ id: schema.exams.id })
            .from(schema.exams)
            .where(eq(schema.exams.id, mockid))
            .limit(1);

        if (res.length === 0) throw new Error("Mock not found");


        const statusRes = await db.update(schema.exams)
            .set({ creation_status: status })
            .where(eq(schema.exams.id, mockid))
            .returning({
                id: schema.exams.id,
                name: schema.exams.name,
                creationstatus: schema.exams.creation_status
            });

        return statusRes[0]

    }
    async checkExamCompletionStatus(examid: string) {
        const examDataResult = await db.select({
            total_questions: schema.exam_patterns.total_questions,
            creationstatus: schema.exams.creation_status,
        })
            .from(schema.exams)
            .innerJoin(schema.exam_patterns, eq(schema.exams.exam_pattern_id, schema.exam_patterns.id))
            .where(eq(schema.exams.id, examid))
            .limit(1);

        const examData = examDataResult[0];

        if (!examData) throw new Error("Exam data not found");
        if (examData.creationstatus === "Done") throw new Error("Exam status already checked");

        // Verify question counts for each part
        await Promise.all(
            (examData.total_questions as number[]).map(async (expectedCount: number, idx: number) => {

                const actualCountResult = await db.select({ value: count() })
                    .from(schema.question_maps)
                    .where(
                        and(
                            eq(schema.question_maps.exam_id, examid),
                            eq(schema.question_maps.part, `part${idx + 1}`)
                        )
                    );

                const actualCount = Number(actualCountResult[0].value);

                if (actualCount !== expectedCount) {
                    throw new Error(
                        `Exam (${examid}) part${idx + 1} question count mismatch. Expected: ${expectedCount}, Found: ${actualCount}`
                    );
                }
            })
        );

        // Update status to Done
        const updateRes = await db.update(schema.exams)
            .set({ creation_status: "Done" })
            .where(eq(schema.exams.id, examid))
            .returning({
                id: schema.exams.id,
                name: schema.exams.name,
                creationstatus: schema.exams.creation_status
            });

        return updateRes[0];
    }

    async getSyllabusDataForExamCreation(syllabusid: string) {
        if (!syllabusid) throw new Error("Syllabus ID not received");

        const results = await db.select({
            subjectName: schema.subjects.name
        })
            .from(schema.subject_syllabus_maps)
            .innerJoin(schema.subjects, eq(schema.subject_syllabus_maps.subject_id, schema.subjects.id))
            .where(eq(schema.subject_syllabus_maps.syllabus_id, syllabusid));

        if (results.length === 0) throw new Error("Syllabus data not found");

        const syllabus = results.map((item) => item.subjectName);
        return syllabus;
    }

    async getQuestionDetailsforProcessing(data: any) {
        const filters: any[] = [];

        // Handle array input (legacy/simple ids)
        if (Array.isArray(data)) {
            filters.push(inArray(schema.questions.id, data));
        } else {
            // Handle object input
            if (data.id) filters.push(eq(schema.questions.id, data.id));
            if (data.ids) filters.push(inArray(schema.questions.id, data.ids));

            if (data.old_topic) {
                filters.push(eq(schema.questions.old_topic, data.old_topic));
            }
            if (data.old_sub_topic) {
                filters.push(eq(schema.questions.old_sub_topic, data.old_sub_topic));
                filters.push(eq(schema.questions.status, "Done"));
            }
        }

        if (filters.length === 0) {
            throw new Error("No valid filters provided");
        }

        let take = data?.limit ? Number(data?.limit) : 1
        let skip = data?.skip ? Number(data?.skip) : 0

        console.log(" log filer where state --> ", data, take, skip);

        let questionData = await db.select()
            .from(schema.questions)
            .where(eq(schema.questions.old_topic, data.old_topic)) // Matching original logic exactly
            .limit(take)
            .offset(skip);

        // This part in original code seems to be filtering by the same 'where' which is 'data.old_topic'
        // But then it filters 'questionData' based on 'isAlreadyInProcessing'.

        let isAlreadyInProcessing = await db.select()
            .from(schema.question_processing)
            .where(and(...filters));

        let finalSelectedQuestion: any[] = []

        if (isAlreadyInProcessing && isAlreadyInProcessing.length !== 0) {
            // remove which are in questionProcessing table 
            const processingIds = new Set(isAlreadyInProcessing.map(item => item.question_id));
            finalSelectedQuestion = questionData.filter(question => !processingIds.has(question.id));
        } else {
            console.log("empty isAlreadyInProcessing data ");
            finalSelectedQuestion = questionData
        }


        if (!finalSelectedQuestion || finalSelectedQuestion.length === 0) throw new Error("Questions not found");
        return finalSelectedQuestion;
    }


    async addProcessingQuestions(data: any[]) {
        if (!data || data.length === 0) return [];

        const result = await db.insert(schema.question_processing)
            .values(data.map((item) => ({
                title: item.title,
                options: item.options,
                ans: item.ans,
                format: item.format || "Text",
                category: item.category,
                topic_id: item.topic_id,
                subject_id: item.subject_id,
                difficulty: item.difficulty,
                is_multiple_answers: item.is_multiple_ans || false,
                explanation: item.explanation,
                links: item.links || [],
                extra: item.extra || undefined,
                status: item.status,
                old_topic: item.old_topic,
                old_sub_topic: item.old_sub_topic,
                created_at: item.created_at,
                created_by: item.created_by,
                processing_status: "Pending" as schema.ProcessingStatus,
                weight: item.weight || 0, // Drizzle schema requires weight
            })))
            .onConflictDoNothing();

        return result;
    }

    async getQuestionDetailsForBot(ids: string[]) {
        const questionData = await db.select({
            id: schema.questions.id,
            title: schema.questions.title,
            difficulty: schema.questions.difficulty,
            topicName: schema.topics.name,
            subjectName: schema.subjects.name,
            explanation: schema.questions.explanation,
            is_multiple_ans: schema.questions.is_multiple_answers,
            status: schema.questions.status,
        })
            .from(schema.questions)
            .leftJoin(schema.topics, eq(schema.questions.topic_id, schema.topics.id))
            .leftJoin(schema.subjects, eq(schema.questions.subject_id, schema.subjects.id))
            .where(inArray(schema.questions.id, ids));

        if (!questionData || questionData.length === 0) throw new Error("Questions not found or invalid IDs");

        // Map back to expected structure
        return questionData.map(q => ({
            id: q.id,
            title: q.title,
            difficulty: q.difficulty,
            Topic: q.topicName ? { name: q.topicName } : null,
            Subject: q.subjectName ? { name: q.subjectName } : null,
            explanation: q.explanation,
            is_multiple_ans: q.is_multiple_ans,
            status: q.status
        }));
    }

    // ### Question Logic
    async getQuestionsIds() {
        const topicNormalAnsQuestionsResult = await db.execute(sql`SELECT  s.name AS subject_name, ARRAY_AGG(q.id) AS ids FROM "questions" q JOIN "subjects" s ON q.subject_id = s.id  WHERE is_multiple_answers = false AND status = 'Done' GROUP BY s.name;`);
        const topicMultiplaAnsQuestionsResult = await db.execute(sql`SELECT  s.name AS subject_name, ARRAY_AGG(q.id) AS ids FROM "questions" q JOIN "subjects" s ON q.subject_id = s.id  WHERE is_multiple_answers = true AND status = 'Done' GROUP BY s.name;`);

        const topicNormalAnsQuestions: QuestionsId[] = topicNormalAnsQuestionsResult.rows as unknown as QuestionsId[];
        const topicMultiplaAnsQuestions: QuestionsId[] = topicMultiplaAnsQuestionsResult.rows as unknown as QuestionsId[];

        return { topicNormalAnsQuestions, topicMultiplaAnsQuestions };
    }

    async getQuestionsByIds(ids: string[]) {

        const questions = await db.select({
            ans: schema.questions.ans,
            id: schema.questions.id,
            explanation: schema.questions.explanation,
            title: schema.questions.title,
            options: schema.questions.options,
            extra: schema.questions.extra,
            format: schema.questions.format,
        })
            .from(schema.questions)
            .where(inArray(schema.questions.id, ids));

        if (!questions || questions.length === 0) throw new Error("Questions not found for given ids");
        return questions;
    }

    async getQuestionsInfoForExam(examid: string) {
        const questionMapData = await db.select()
            .from(schema.question_maps)
            .where(eq(schema.question_maps.exam_id, examid));

        if (!questionMapData || questionMapData.length === 0) throw new Error("Given exam doesn't contain any questions");

        // Map back to expected structure for callers
        return questionMapData.map(q => ({
            ...q,
            questionid: q.question_id,
            examid: q.exam_id
        }));
    }

    async addQuestionsToExam(questions: any[]) {
        return await db.insert(schema.question_maps)
            .values(questions.map(q => ({
                number: q.number,
                question_id: q.questionid,
                part: q.part,
                exam_id: q.examid
            })));

    }

    // ### Exam Pattern Logic
    async getMockSetExamPattern(mockid: string) {
        const infoResult = await db.select({
            exam_pattern: schema.exam_patterns
        })
            .from(schema.exams)
            .innerJoin(schema.exam_patterns, eq(schema.exams.exam_pattern_id, schema.exam_patterns.id))
            .where(eq(schema.exams.id, mockid))
            .limit(1);

        if (infoResult.length === 0) throw new Error("Exam pattern info not found");

        // Map back to expected structure for callers
        const pattern = infoResult[0].exam_pattern;
        return {
            exam_pattern: {
                ...pattern,
                is_multiple_ans: pattern.is_multiple_answers,
                syllabusid: pattern.syllabus_id
            }
        };
    }

    async getExamPatternId(examid: string) {
        const data = await db.select({ exam_pattern_id: schema.exams.exam_pattern_id })
            .from(schema.exams)
            .where(eq(schema.exams.id, examid))
            .limit(1);

        if (data.length === 0) throw new Error("Exam details not found");
        return data[0].exam_pattern_id;
    }

    async getExamPattern(exampatternid: string) {
        const pattern = await db.select()
            .from(schema.exam_patterns)
            .where(eq(schema.exam_patterns.id, exampatternid))
            .limit(1);

        if (pattern.length === 0) throw new Error("Exam pattern details not found");

        // Map back to expected structure for callers
        return {
            ...pattern[0],
            is_multiple_ans: pattern[0].is_multiple_answers,
            syllabusid: pattern[0].syllabus_id
        };
    }

    async getExamDetails(examid: string) {
        const data = await db.select()
            .from(schema.exams)
            .where(eq(schema.exams.id, examid))
            .limit(1);

        if (data.length === 0) throw new Error("Exam details not found");

        // Map back to expected structure for callers
        return {
            ...data[0],
            examtype: data[0].exam_type
        };
    }

    // ### Answer Logic
    async getExamAnswers(examid: string) {
        const questions_map_data = await db.select()
            .from(schema.question_maps)
            .where(eq(schema.question_maps.exam_id, examid));

        if (!questions_map_data || questions_map_data.length === 0) throw new Error("Exam invalid or doesn't have any ans");

        const questionIds = questions_map_data.map((item) => item.question_id);

        const questionData = await db.select({
            id: schema.questions.id,
            ans: schema.questions.ans,
            topic_id: schema.questions.topic_id
        })
            .from(schema.questions)
            .where(inArray(schema.questions.id, questionIds));

        if (!questionData || questionData.length === 0) throw new Error("Question info not found");

        const questionDataMap = new Map(questionData.map((d) => [d.id, d]));

        const ans: any[] = [];
        questions_map_data.forEach((question) => {
            const que = questionDataMap.get(question.question_id);
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
