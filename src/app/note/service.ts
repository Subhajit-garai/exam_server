import { db } from "@/db/index.js";
import {
  topics,
  subjects,
  categories,
  topic_note_versions,
} from "@/db/schema/note.js";
import { user_topic_progress } from "@/db/schema/progress.js";
import { syllabuses, subject_syllabus_maps } from "@/db/schema/syllabus.js";
import { target_exams, exam_years } from "@/db/schema/exam.js";
import { eq, and, or, inArray, sql, ilike } from "drizzle-orm";

export class NoteService {
  async like(topicId: string) {
    const [topicData] = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, topicId));
    if (!topicData) throw new Error("Topic data not found in database");

    return await db.transaction(async (tx) => {
      await tx.insert(topic_note_versions).values({
        topic_id: topicData.id,
        content: topicData.content,
        version: topicData.version,
        attachments: topicData.attachments,
      });

      const [updatedContent] = await tx
        .update(topics)
        .set({ like: sql`${topics.like} + 1` })
        .where(eq(topics.id, topicData.id))
        .returning();

      return updatedContent;
    });
  }

  async dislike(topicSlug: string) {
    const [topicData] = await db
      .select()
      .from(topics)
      .where(eq(topics.slug, topicSlug));
    if (!topicData) throw new Error("Topic data not found in database");

    return await db.transaction(async (tx) => {
      await tx.insert(topic_note_versions).values({
        topic_id: topicData.id,
        content: topicData.content,
        version: topicData.version,
        attachments: topicData.attachments,
      });

      const [updatedContent] = await tx
        .update(topics)
        .set({ dis_like: sql`${topics.dis_like} + 1` })
        .where(eq(topics.id, topicData.id))
        .returning();

      return updatedContent;
    });
  }

  async updateContentOfTopic(topicId: string, newContent: any) {
    return await db.transaction(async (tx) => {
      const [topicData] = await tx
        .select()
        .from(topics)
        .where(eq(topics.id, topicId));
      if (!topicData) throw new Error("Topic data not found in database");

      await tx.insert(topic_note_versions).values({
        topic_id: topicData.id,
        content: topicData.content,
        version: topicData.version,
        attachments: topicData.attachments,
      });

      const [updatedContent] = await tx
        .update(topics)
        .set({
          content: newContent,
          version: sql`${topics.version} + 1`,
        })
        .where(eq(topics.id, topicId))
        .returning();

      return updatedContent;
    });
  }

  async createTopic(data: any) {
    const [topic] = await db.insert(topics).values(data).returning();
    return topic;
  }

  async deleteTopic(id: string) {
    const [isExist] = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.id, id));
    if (!isExist) throw new Error("Topic not found");

    const [topic] = await db
      .delete(topics)
      .where(eq(topics.id, id))
      .returning();
    return topic;
  }

  async deleteSubject(id: string) {
    const [isExist] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id));
    if (!isExist) throw new Error("Subject not found");

    const [subject] = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();
    return subject;
  }

  async createSubject(data: any) {
    const [subject] = await db.insert(subjects).values(data).returning();
    return subject;
  }

  async getAllVersionOfNote(topicSlug: string) {
    const [topicdata] = await db
      .select({ id: topics.id })
      .from(topics)
      .where(eq(topics.slug, topicSlug));
    if (!topicdata) throw new Error("Topic not found");

    const versions = await db
      .select()
      .from(topic_note_versions)
      .where(eq(topic_note_versions.topic_id, topicdata.id));
    return versions;
  }

  async getAllNoteTopic(slug: string) {
    const [subjectdata] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.slug, slug));
    if (!subjectdata) throw new Error("Subject not found");

    const topicList = await db
      .select({
        id: topics.id,
        order: topics.order,
        name: topics.name,
        shortName: topics.short_name,
        description: topics.description,
        created_at: topics.created_at,
        updated_at: topics.updated_at,
        slug: topics.slug,
        iconUrl: topics.icon_url,
        color: topics.color,
        isPublic: topics.is_public,
        status: topics.status,
        subjectId: topics.subject_id,
        isparentTopic: topics.is_parent_topic,
        parentTopicId: topics.parent_topic_id,
        tags: topics.tags,
        like: topics.like,
        dislike: topics.dis_like,
        readCount: topics.read_count,
        comments: topics.comments,
        commentEnabled: topics.comment_enabled,
        verified: topics.verified,
        estimatedReadTime: topics.estimated_read_time,
        version: topics.version,
        attachments: topics.attachments,
        publishedAt: topics.published_at,
        language: topics.language,
        createdBy: topics.created_by,
        updatedBy: topics.updated_by,
      })
      .from(topics)
      .where(eq(topics.subject_id, subjectdata.id));

    return topicList;
  }

  async getAllNoteSubjectForUser(exam_id?: string, exam_year_id?: string) {
    if (exam_id && exam_year_id) {
      const syllabiData = await db
        .select({ id: syllabuses.id })
        .from(syllabuses)
        .where(eq(syllabuses.exam_year_id, exam_year_id));
      const syllabusIds = syllabiData.map((s) => s.id);

      if (syllabusIds.length === 0) return [];

      const subjectMaps = await db
        .select({ subject: subjects })
        .from(subject_syllabus_maps)
        .innerJoin(subjects, eq(subject_syllabus_maps.subject_id, subjects.id))
        .where(inArray(subject_syllabus_maps.syllabus_id, syllabusIds));

      const subjectList = subjectMaps.map((sm) => sm.subject);
      const uniqueSubjects = Array.from(
        new Map(subjectList.map((s) => [s.id, s])).values(),
      );

      return uniqueSubjects;
    }

    return await db.select().from(subjects);
  }

  async getAllNoteSubjectByCategory(category?: string) {
    if (category) {
      const subjectList = await db
        .select({ subject: subjects })
        .from(subjects)
        .innerJoin(categories, eq(subjects.category_id, categories.id))
        .where(eq(categories.name, category));

      return subjectList.map((s) => s.subject);
    }

    return await db.select().from(subjects);
  }

  async getAllNoteSubjectByExam(exam?: string) {
    if (exam) {
      const [targetExam] = await db
        .select({ id: target_exams.id })
        .from(target_exams)
        .where(
          or(
            ilike(target_exams.name, exam),
            ilike(target_exams.short_code, exam),
          ),
        );

      if (!targetExam) return [];

      const examYearsData = await db
        .select({ id: exam_years.id })
        .from(exam_years)
        .where(eq(exam_years.target_exam_id, targetExam.id));
      const examYearIds = examYearsData.map((ey) => ey.id);

      if (examYearIds.length === 0) return [];

      const syllabiData = await db
        .select({ id: syllabuses.id })
        .from(syllabuses)
        .where(inArray(syllabuses.exam_year_id, examYearIds));
      const syllabusIds = syllabiData.map((s) => s.id);

      if (syllabusIds.length === 0) return [];

      const subjectMaps = await db
        .select({ subject: subjects })
        .from(subject_syllabus_maps)
        .innerJoin(subjects, eq(subject_syllabus_maps.subject_id, subjects.id))
        .where(inArray(subject_syllabus_maps.syllabus_id, syllabusIds));

      const subjectList = subjectMaps.map((sm) => sm.subject);
      const uniqueSubjects = Array.from(
        new Map(subjectList.map((s) => [s.id, s])).values(),
      );

      return uniqueSubjects;
    }

    return await db.select().from(subjects);
  }

  async getTopic(topicId: string) {
    const [note] = await db
      .select({
        content: topics.content,
        name: topics.name,
        order: topics.order,
        description: topics.description,
        slug: topics.slug,
        tags: topics.tags,
        like: topics.like,
        dislike: topics.dis_like,
        readCount: topics.read_count,
        isPublic: topics.is_public,
        estimatedReadTime: topics.estimated_read_time,
        version: topics.version,
        attachments: topics.attachments,
        status: topics.status,
      })
      .from(topics)
      .where(eq(topics.id, topicId));
    return note;
  }

  async getNote(subjectSlug: string, topicSlug: string, userId: string) {
    const [note] = await db
      .select({
        id: topics.id,
        content: topics.content,
        name: topics.name,
        order: topics.order,
        description: topics.description,
        slug: topics.slug,
        tags: topics.tags,
        like: topics.like,
        dislike: topics.dis_like,
        readCount: topics.read_count,
        isPublic: topics.is_public,
        estimatedReadTime: topics.estimated_read_time,
        version: topics.version,
        attachments: topics.attachments,
        status: topics.status,
      })
      .from(topics)
      .innerJoin(subjects, eq(topics.subject_id, subjects.id))
      .where(and(eq(topics.slug, topicSlug), eq(subjects.slug, subjectSlug)));

    if (!note) throw new Error("Note not found");

    const [topicProgress] = await db
      .select()
      .from(user_topic_progress)
      .where(
        and(
          eq(user_topic_progress.topic_id, note.id),
          eq(user_topic_progress.user_id, userId),
        ),
      );

    if (!topicProgress) {
      await db.insert(user_topic_progress).values({
        topic_id: note.id,
        user_id: userId,
        status: "IN_PROGRESS",
        time_spent: 0,
      });
    }

    return note;
  }
}

export const noteService = new NoteService();
