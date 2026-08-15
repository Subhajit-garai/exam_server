import { db } from "@/db/index.js";
import {
  syllabuses,
  subject_syllabus_maps,
  topic_subject_maps,
  subjects,
  topics,
  exam_years,
  target_exams,
} from "@/db/schema.js";
import { eq, and } from "drizzle-orm";
import {
  AddSubjectInputZodSchemaById,
  AddSubjectInputZodSchemaByName,
  AddSubjectInputZodSchemaByShortName,
  AddTopicInputZodSchemaById,
  AddTopicInputZodSchemaByName,
  AddTopicInputZodSchemaByShortName,
} from "@/zod/syllabus.zod.js";
import { ZodDataSafeParse } from "@/utils/ZodTypeChecker.js";

type fomatedSubject_type = {
  subject: string;
  weightage: number | null;
  topics: string[];
};

type formatedSyllabus_type = {
  id: string;
  subjects: fomatedSubject_type[];
  created_at: string;
  exam: string | null | undefined;
  examYear: number | null | undefined;
};

export class SyllabusService {
  async createSyllabus(data: any) {
    if (!data.exam_year_id) {
      throw Error("exam_year_id not found, it is required");
    }

    const [response] = await db
      .insert(syllabuses)
      .values({
        ...data,
      })
      .returning();

    if (!response) {
      throw Error("Syllabus not created");
    }

    return response;
  }

  async getSyllabusById(syllabusid: string) {
    const [response] = await db
      .select()
      .from(syllabuses)
      .where(eq(syllabuses.id, syllabusid));

    if (!response) {
      throw Error("Syllabus not exist");
    }

    return response;
  }

  async getAllSyllabus() {
    const response = await db.select().from(syllabuses);
    if (!response) throw Error("error while fetching all syllabus");
    return response;
  }

  async deleteSyllabus(id: string) {
    const [response] = await db
      .delete(syllabuses)
      .where(eq(syllabuses.id, id))
      .returning();
    if (!response) throw Error("error while deleting syllabus");
    return response;
  }

  async getSyllabusByExamYearId(id: string) {
    const response = await db
      .select()
      .from(syllabuses)
      .where(eq(syllabuses.exam_year_id, id));
    if (!response) throw Error("error while fetching all syllabus");
    return response;
  }

  async getSyllabusName() {
    const rows = await db
      .select({
        id: syllabuses.id,
        type: syllabuses.type,
        title: syllabuses.title,
        description: syllabuses.description,
        subject: {
          shortName: subjects.short_name,
          slug: subjects.slug,
          order: subjects.order,
          name: subjects.name,
        },
      })
      .from(syllabuses)
      .leftJoin(
        subject_syllabus_maps,
        eq(syllabuses.id, subject_syllabus_maps.syllabus_id),
      )
      .leftJoin(subjects, eq(subject_syllabus_maps.subject_id, subjects.id));

    const syllabusMap = new Map();
    rows.forEach((row) => {
      if (!syllabusMap.has(row.id)) {
        syllabusMap.set(row.id, {
          id: row.id,
          type: row.type,
          title: row.title,
          description: row.description,
          SubjectSyllabusMap: [],
        });
      }
      if (row.subject && row.subject.name) {
        syllabusMap
          .get(row.id)
          .SubjectSyllabusMap.push({ subject: row.subject });
      }
    });

    const response = Array.from(syllabusMap.values());

    if (!response) throw Error("error while fetching all syllabus");
    return response;
  }

  async addSubject(data: any, by: "id" | "name" | "shortname" = "id") {
    let Subject_added;

    switch (by) {
      case "name": {
        let processedata = AddSubjectInputZodSchemaByName.safeParse(data);
        if (!processedata.success) throw ZodDataSafeParse(processedata, true);

        let { name, ...rest } = processedata.data;
        const [subject] = await db
          .select()
          .from(subjects)
          .where(eq(subjects.name, name));
        if (!subject) throw Error(`subject not found , given name :-${name}`);

        const [inserted] = await db
          .insert(subject_syllabus_maps)
          .values({ ...rest, subject_id: subject.id })
          .returning();
        Subject_added = inserted;
        break;
      }
      case "shortname": {
        let processedata = AddSubjectInputZodSchemaByShortName.safeParse(data);
        if (!processedata.success) throw ZodDataSafeParse(processedata, true);

        let { shortName, ...rest } = processedata.data;
        const [subject] = await db
          .select()
          .from(subjects)
          .where(eq(subjects.short_name, shortName));
        if (!subject)
          throw Error(`subject not found , given shortName :-${shortName}`);

        const [inserted] = await db
          .insert(subject_syllabus_maps)
          .values({ ...rest, subject_id: subject.id })
          .returning();
        Subject_added = inserted;
        break;
      }
      default: {
        let processedata = AddSubjectInputZodSchemaById.safeParse(data);
        if (!processedata.success) throw ZodDataSafeParse(processedata, true);

        const [inserted] = await db
          .insert(subject_syllabus_maps)
          .values({ ...processedata.data })
          .returning();
        Subject_added = inserted;
        break;
      }
    }

    if (!Subject_added) throw Error("error while Subject creation");
    return Subject_added;
  }

  async removeSubject(syllabusid: string, subjectid: string) {
    const [Subject_removed] = await db
      .delete(subject_syllabus_maps)
      .where(
        and(
          eq(subject_syllabus_maps.syllabus_id, syllabusid),
          eq(subject_syllabus_maps.subject_id, subjectid),
        ),
      )
      .returning();

    if (!Subject_removed) throw Error("error while Subject deletion");
    return Subject_removed;
  }

  async addTopic(data: any, by: "id" | "name" | "shortname" = "id") {
    let Topic_added;

    switch (by) {
      case "name": {
        let processedata = AddTopicInputZodSchemaByName.safeParse(data);
        if (!processedata.success) throw ZodDataSafeParse(processedata, true);

        let { name, subject_id, syllabus_id, weightage } = processedata.data;
        const [subject_map] = await db
          .select()
          .from(subject_syllabus_maps)
          .where(
            and(
              eq(subject_syllabus_maps.syllabus_id, syllabus_id),
              eq(subject_syllabus_maps.subject_id, subject_id),
            ),
          );
        if (!subject_map)
          throw Error("syllabus doesnot have selected sullabus");

        const [topic] = await db
          .select()
          .from(topics)
          .where(eq(topics.name, name));
        if (!topic) throw Error(`selectd topic not found : name: ${name}`);

        const [inserted] = await db
          .insert(topic_subject_maps)
          .values({
            topic_id: topic.id,
            weightage: weightage,
            subject_map_id: subject_map.id,
          })
          .returning();
        Topic_added = inserted;
        break;
      }
      case "shortname": {
        let processedata = AddTopicInputZodSchemaByShortName.safeParse(data);
        if (!processedata.success) throw ZodDataSafeParse(processedata, true);

        let { shortName, subject_id, syllabus_id, weightage } =
          processedata.data;
        const [subject_map] = await db
          .select()
          .from(subject_syllabus_maps)
          .where(
            and(
              eq(subject_syllabus_maps.syllabus_id, syllabus_id),
              eq(subject_syllabus_maps.subject_id, subject_id),
            ),
          );
        if (!subject_map)
          throw Error("syllabus doesnot have selected sullabus");

        const [topic] = await db
          .select()
          .from(topics)
          .where(eq(topics.short_name, shortName));
        if (!topic) throw Error(`selectd topic not found : name: ${shortName}`);

        const [inserted] = await db
          .insert(topic_subject_maps)
          .values({
            topic_id: topic.id,
            weightage: weightage,
            subject_map_id: subject_map.id,
          })
          .returning();
        Topic_added = inserted;
        break;
      }
      default: {
        let processedata = AddTopicInputZodSchemaById.safeParse(data);
        if (!processedata.success) throw ZodDataSafeParse(processedata, true);

        let { topic_id, subject_id, syllabus_id, weightage } =
          processedata.data;
        const [subject_map] = await db
          .select()
          .from(subject_syllabus_maps)
          .where(
            and(
              eq(subject_syllabus_maps.syllabus_id, syllabus_id),
              eq(subject_syllabus_maps.subject_id, subject_id),
            ),
          );
        if (!subject_map)
          throw Error("syllabus doesnot have selected sullabus");

        const [inserted] = await db
          .insert(topic_subject_maps)
          .values({
            topic_id: topic_id,
            weightage: weightage,
            subject_map_id: subject_map.id,
          })
          .returning();
        Topic_added = inserted;
        break;
      }
    }

    if (!Topic_added) throw Error("error while topie update in syllabus");
    return Topic_added;
  }

  async removeTopic(syllabusId: string, subjectId: string, topicId: string) {
    const [subject_map] = await db
      .select()
      .from(subject_syllabus_maps)
      .where(
        and(
          eq(subject_syllabus_maps.syllabus_id, syllabusId),
          eq(subject_syllabus_maps.subject_id, subjectId),
        ),
      );

    if (!subject_map) throw Error("syllabus doesnot have selected sullabus");

    const [Topic_removed] = await db
      .delete(topic_subject_maps)
      .where(
        and(
          eq(topic_subject_maps.subject_map_id, subject_map.id),
          eq(topic_subject_maps.topic_id, topicId),
        ),
      )
      .returning();

    if (!Topic_removed)
      throw Error("error while topic deletion for sullabus subject");
    return Topic_removed;
  }

  async getFormattedSyllabus(exam_year_id?: string, syllabusid?: string) {
    if (!exam_year_id && !syllabusid) {
      throw Error("invalid exam year id or syllabus id");
    }

    let syllabus: any;
    const fetchSyllabus = async (whereClause: any) => {
      const [baseSyllabus] = await db
        .select({
          id: syllabuses.id,
          created_at: syllabuses.created_at,
          exam_year: {
            year: exam_years.year,
          },
          targetExam: {
            shortCode: target_exams.short_code,
          },
        })
        .from(syllabuses)
        .leftJoin(exam_years, eq(syllabuses.exam_year_id, exam_years.id))
        .leftJoin(target_exams, eq(exam_years.target_exam_id, target_exams.id))
        .where(whereClause)
        .limit(1);

      if (!baseSyllabus) return null;

      const subjectMaps = await db
        .select({
          id: subject_syllabus_maps.id,
          weightage: subject_syllabus_maps.weightage,
          subject: {
            name: subjects.name,
            shortName: subjects.short_name,
          },
        })
        .from(subject_syllabus_maps)
        .leftJoin(subjects, eq(subject_syllabus_maps.subject_id, subjects.id))
        .where(
          eq(subject_syllabus_maps.syllabus_id, baseSyllabus.id as string),
        );

      const subjectMapsWithTopics = await Promise.all(
        subjectMaps.map(async (sm) => {
          const topicList = await db
            .select({
              Topic: {
                name: topics.name,
                shortName: topics.short_name,
              },
            })
            .from(topic_subject_maps)
            .leftJoin(topics, eq(topic_subject_maps.topic_id, topics.id))
            .where(eq(topic_subject_maps.subject_map_id, sm.id));

          return { ...sm, TopicsSubjectMap: topicList };
        }),
      );

      return { ...baseSyllabus, SubjectSyllabusMap: subjectMapsWithTopics };
    };

    if (exam_year_id) {
      syllabus = await fetchSyllabus(eq(syllabuses.exam_year_id, exam_year_id));
    } else if (syllabusid) {
      syllabus = await fetchSyllabus(eq(syllabuses.id, syllabusid));
    }

    if (!syllabus) throw Error("syllabus data not exist");

    let formated_syllabus: formatedSyllabus_type = {
      id: syllabus.id,
      subjects: [],
      created_at: syllabus.created_at.toISOString(),
      exam: syllabus?.targetExam?.shortCode,
      examYear: syllabus?.exam_year?.year,
    };

    syllabus.SubjectSyllabusMap.forEach((subjectData: any) => {
      let data: fomatedSubject_type = {
        subject: subjectData.subject?.name || "",
        weightage: subjectData.weightage,
        topics: [],
      };

      if (!subjectData.subject?.name) throw Error("subject short name invalid");

      data.topics = subjectData.TopicsSubjectMap.map((t: any) => {
        if (!t.Topic?.name) throw Error("topic short name invalid");
        return t.Topic.name;
      });

      formated_syllabus.subjects.push(data);
    });

    return formated_syllabus;
  }

  async getDetaildformatedSyllabus(syllabusid?: string) {
    if (!syllabusid) {
      throw Error("invalid exam year id or syllabus id");
    }

    const [baseSyllabus] = await db
      .select()
      .from(syllabuses)
      .where(eq(syllabuses.id, syllabusid))
      .limit(1);

    if (!baseSyllabus) throw Error("syllabus data not exist");

    const subjectMaps = await db
      .select({
        id: subject_syllabus_maps.id,
        weightage: subject_syllabus_maps.weightage,
        subject: {
          name: subjects.name,
          shortName: subjects.short_name,
        },
      })
      .from(subject_syllabus_maps)
      .leftJoin(subjects, eq(subject_syllabus_maps.subject_id, subjects.id))
      .where(eq(subject_syllabus_maps.syllabus_id, baseSyllabus.id));

    const subjectMapsWithTopics = await Promise.all(
      subjectMaps.map(async (sm) => {
        const topicList = await db
          .select({
            Topic: {
              name: topics.name,
              shortName: topics.short_name,
            },
          })
          .from(topic_subject_maps)
          .leftJoin(topics, eq(topic_subject_maps.topic_id, topics.id))
          .where(eq(topic_subject_maps.subject_map_id, sm.id));

        return { ...sm, TopicsSubjectMap: topicList };
      }),
    );

    return { ...baseSyllabus, SubjectSyllabusMap: subjectMapsWithTopics };
  }
}

export const syllabusService = new SyllabusService();
