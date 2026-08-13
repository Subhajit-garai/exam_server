import { db } from "@/db/index.js";
import { exams, exam_patterns } from "@/db/schema/exam.js";
import { question_maps, questions } from "@/db/schema/question.js";
import { categories, subjects, topics } from "@/db/schema/note.js";
import { eq, and, or, desc, asc, count, inArray } from "drizzle-orm";
import { CustomError } from "@/middleware/globalErrorHandler.js";
import { ExamManager } from "@/lib/manager/examManager.js";

const em = ExamManager.getInstance();

export class MockService {
  async getAllMock(userId: string) {
    const rows = await db
      .select({
        exam: exams,
        exam_pattern: exam_patterns,
        category: categories,
      })
      .from(exams)
      .innerJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .leftJoin(categories, eq(exam_patterns.category_id, categories.id))
      .where(
        and(
          eq(exams.exam_type, "Mock"),
          or(eq(exams.created_by, userId), eq(exams.visibility, "Public")),
        ),
      )
      .orderBy(desc(exams.created_at));

    if (rows.length === 0) return [];

    const examIds = rows.map((r) => r.exam.id);
    const counts = await db
      .select({
        exam_id: question_maps.exam_id,
        count: count(question_maps.id),
      })
      .from(question_maps)
      .where(inArray(question_maps.exam_id, examIds))
      .groupBy(question_maps.exam_id);

    const countMap = new Map(counts.map((c) => [c.exam_id, c.count]));

    return rows.map((row) => ({
      ...row.exam,
      exam_pattern: {
        ...row.exam_pattern,
        Category: row.category,
      },
      _count: {
        questionsMap: countMap.get(row.exam.id) || 0,
      },
    }));
  }

  async refresh(mockid: string, userid: string) {
    return em.refresh(mockid, userid, "MOCK_PROCESSING");
  }

  async selectRandomQuestion(mockid: string, userid: string) {
    return em.refresh(mockid, userid);
  }

  async deleteQuestionsFromMock(mockid: string) {
    const [status] = await db
      .delete(question_maps)
      .where(eq(question_maps.exam_id, mockid))
      .returning();

    if (!status) throw new Error("Failed to delete questions from mock");

    return status;
  }

  async getMockById(id: string) {
    const [row] = await db
      .select({
        exam: exams,
        exam_pattern: exam_patterns,
        category: categories,
      })
      .from(exams)
      .innerJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .leftJoin(categories, eq(exam_patterns.category_id, categories.id))
      .where(and(eq(exams.exam_type, "Mock"), eq(exams.id, id)));

    if (!row) {
      throw new Error("Mock Question Set not found");
    }

    const [{ value: qCount }] = await db
      .select({ value: count() })
      .from(question_maps)
      .where(eq(question_maps.exam_id, id));

    return {
      ...row.exam,
      exam_pattern: {
        ...row.exam_pattern,
        Category: row.category,
      },
      _count: {
        questionsMap: qCount || 0,
      },
    };
  }

  async getMockSetQuestions(mockId: string) {
    const response = await db
      .select({
        id: question_maps.id,
        number: question_maps.number,
        question_id: question_maps.question_id,
        part: question_maps.part,
        exam_id: question_maps.exam_id,
        created_at: question_maps.created_at,
        updated_at: question_maps.updated_at,
        question: questions,
      })
      .from(question_maps)
      .innerJoin(questions, eq(question_maps.question_id, questions.id))
      .where(eq(question_maps.exam_id, mockId))
      .orderBy(asc(question_maps.number));

    return response;
  }

  async addQuestionToMock(
    mockId: string,
    questionId: string,
    part: string = "part1",
    number: number,
  ) {
    const [response] = await db
      .insert(question_maps)
      .values({
        exam_id: mockId,
        question_id: questionId,
        part: part,
        number: number,
      })
      .returning();
    return response;
  }

  async removeQuestionFromMock(mockId: string, questionId: string) {
    const response = await db
      .delete(question_maps)
      .where(
        and(
          eq(question_maps.exam_id, mockId),
          eq(question_maps.question_id, questionId),
        ),
      )
      .returning();
    return response;
  }

  async getExamPatterForMock(mockId: string) {
    const [response] = await db
      .select({
        exam_pattern: exam_patterns,
      })
      .from(exams)
      .innerJoin(exam_patterns, eq(exams.exam_pattern_id, exam_patterns.id))
      .where(eq(exams.id, mockId));

    if (!response || !response.exam_pattern)
      throw new Error("Mock Set not found");
    return response.exam_pattern;
  }

  async getAvailableMock() {
    const response = await db
      .select({
        id: exams.id,
        name: exams.name,
      })
      .from(exams)
      .where(and(eq(exams.exam_type, "Mock"), eq(exams.visibility, "Public")));
    return response;
  }

  async getMockQuestions(mockId: string, info: "full" | "Onlyid") {
    const [isMock] = await db
      .select({ id: exams.id })
      .from(exams)
      .where(and(eq(exams.exam_type, "Mock"), eq(exams.id, mockId)));

    if (!isMock) {
      throw new CustomError("mock set not found ", 400);
    }

    let questionList: any;

    if (info === "Onlyid") {
      questionList = await db
        .select()
        .from(question_maps)
        .where(eq(question_maps.exam_id, mockId));
    } else {
      questionList = await db
        .select({
          id: question_maps.id,
          number: question_maps.number,
          question_id: question_maps.question_id,
          part: question_maps.part,
          exam_id: question_maps.exam_id,
          created_at: question_maps.created_at,
          updated_at: question_maps.updated_at,
          question: questions,
          topic: topics,
          subject: subjects,
        })
        .from(question_maps)
        .innerJoin(questions, eq(question_maps.question_id, questions.id))
        .leftJoin(topics, eq(questions.topic_id, topics.id))
        .leftJoin(subjects, eq(questions.subject_id, subjects.id))
        .where(eq(question_maps.exam_id, mockId));

      // Map back to nested structure if needed by frontend
      questionList = questionList.map((q: any) => ({
        ...q,
        question: {
          ...q.question,
          Topic: q.topic,
          Subject: q.subject,
        },
      }));
    }

    return questionList;
  }
}
