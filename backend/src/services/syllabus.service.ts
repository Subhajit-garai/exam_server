import prisma from "@repo/db/index.js";
import {
    AddSubjectInputZodSchemaById,
    AddSubjectInputZodSchemaByName,
    AddSubjectInputZodSchemaByShortName,
    AddTopicInputZodSchemaById,
    AddTopicInputZodSchemaByName,
    AddTopicInputZodSchemaByShortName,
} from "@/zod/syllabus.zod.js";
import { ZodDataSafeParse } from "@/lib/ZodTypeChecker.js";

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

        const response = await prisma.syllabus.create({
            data: {
                ...data,
            },
        });

        if (!response) {
            throw Error("Syllabus not created");
        }

        return response;
    }

    async getSyllabusById(syllabusid: string) {
        const response = await prisma.syllabus.findFirst({
            where: {
                id: syllabusid,
            },
        });

        if (!response) {
            throw Error("Syllabus not exist");
        }

        return response;
    }

    async getAllSyllabus() {
        const response = await prisma.syllabus.findMany({});
        if (!response) throw Error("error while fetching all syllabus");
        return response;
    }
    async deleteSyllabus(id: string) {
        const response = await prisma.syllabus.delete({
            where: {
                id: id,
            },
        });

        if (!response) throw Error("error while deleting syllabus");
        return response;
    }

    async getSyllabusByExamYearId(id: string) {
        const response = await prisma.syllabus.findMany({
            where: {
                exam_year_id: id,
            },
        });
        if (!response) throw Error("error while fetching all syllabus");
        return response;
    }

    async getSyllabusName() {
        const response = await prisma.syllabus.findMany({
            select: {
                id: true,
                type: true,
                title: true,
                description: true,
                SubjectSyllabusMap: {
                    select: {
                        subject: {
                            select: {
                                shortName: true,
                                slug: true,
                                order: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

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
                let subject = await prisma.subject.findFirst({ where: { name: name } });
                if (!subject) throw Error(`subject not found , given name :-${name}`);

                Subject_added = await prisma.subjectSyllabusMap.create({
                    data: { ...rest, subject_id: subject.id },
                });
                break;
            }
            case "shortname": {
                let processedata = AddSubjectInputZodSchemaByShortName.safeParse(data);
                if (!processedata.success) throw ZodDataSafeParse(processedata, true);

                let { shortName, ...rest } = processedata.data;
                let subject = await prisma.subject.findFirst({ where: { shortName: shortName } });
                if (!subject) throw Error(`subject not found , given shortName :-${shortName}`);

                Subject_added = await prisma.subjectSyllabusMap.create({
                    data: { ...processedata.data, subject_id: subject.id },
                });
                break;
            }
            default: {
                let processedata = AddSubjectInputZodSchemaById.safeParse(data);
                if (!processedata.success) throw ZodDataSafeParse(processedata, true);

                Subject_added = await prisma.subjectSyllabusMap.create({
                    data: { ...processedata.data },
                });
                break;
            }
        }

        if (!Subject_added) throw Error("error while Subject creation");
        return Subject_added;
    }

    async removeSubject(syllabusid: string, subjectid: string) {
        const Subject_removed = await prisma.subjectSyllabusMap.delete({
            where: {
                syllabusId_subject_id: {
                    syllabusId: syllabusid,
                    subject_id: subjectid,
                },
            },
        });

        if (!Subject_removed) throw Error("error while Subject deletion");
        return Subject_removed;
    }

    async addTopic(data: any, by: "id" | "name" | "shortname" = "id") {
        let Subject_added;

        switch (by) {
            case "name": {
                let processedata = AddTopicInputZodSchemaByName.safeParse(data);
                if (!processedata.success) throw ZodDataSafeParse(processedata, true);

                let { name, subject_id, syllabusId, weightage } = processedata.data;
                let subject_map = await prisma.subjectSyllabusMap.findFirst({
                    where: { syllabusId: syllabusId, subject_id: subject_id },
                });
                if (!subject_map) throw Error("syllabus doesnot have selected sullabus");

                let topic = await prisma.topic.findFirst({ where: { name: name } });
                if (!topic) throw Error(`selectd topic not found : name: ${name}`);

                Subject_added = await prisma.topicsSubjectMap.create({
                    data: { topic_id: topic.id, weightage: weightage, subject_map_id: subject_map.id },
                });
                break;
            }
            case "shortname": {
                let processedata = AddTopicInputZodSchemaByShortName.safeParse(data);
                if (!processedata.success) throw ZodDataSafeParse(processedata, true);

                let { shortName, subject_id, syllabusId, weightage } = processedata.data;
                let subject_map = await prisma.subjectSyllabusMap.findFirst({
                    where: { syllabusId: syllabusId, subject_id: subject_id },
                });
                if (!subject_map) throw Error("syllabus doesnot have selected sullabus");

                let topic = await prisma.topic.findFirst({ where: { shortName: shortName } });
                if (!topic) throw Error(`selectd topic not found : name: ${shortName}`);

                Subject_added = await prisma.topicsSubjectMap.create({
                    data: { topic_id: topic.id, weightage: weightage, subject_map_id: subject_map.id },
                });
                break;
            }
            default: {
                let processedata = AddTopicInputZodSchemaById.safeParse(data);
                if (!processedata.success) throw ZodDataSafeParse(processedata, true);

                let { topic_id, subject_id, syllabusId, weightage } = processedata.data;
                let subject_map = await prisma.subjectSyllabusMap.findFirst({
                    where: { syllabusId: syllabusId, subject_id: subject_id },
                });
                if (!subject_map) throw Error("syllabus doesnot have selected sullabus");

                Subject_added = await prisma.topicsSubjectMap.create({
                    data: { topic_id: topic_id, weightage: weightage, subject_map_id: subject_map.id },
                });
                break;
            }
        }

        if (!Subject_added) throw Error("error while topie update in syllabus");
        return Subject_added;
    }

    async removeTopic(syllabusId: string, subjectId: string, topicId: string) {
        let subject_map = await prisma.subjectSyllabusMap.findFirst({
            where: {
                syllabusId: syllabusId,
                subject_id: subjectId,
            },
        });

        if (!subject_map) throw Error("syllabus doesnot have selected sullabus");

        let Subject_removed = await prisma.topicsSubjectMap.delete({
            where: {
                subject_map_id_topic_id: {
                    subject_map_id: subject_map.id,
                    topic_id: topicId,
                },
            },
        });

        if (!Subject_removed) throw Error("error while topic deletion for sullabus subject");
        return Subject_removed;
    }

    async getFormattedSyllabus(exam_year_id?: string, syllabusid?: string) {
        if (!exam_year_id && !syllabusid) {
            throw Error("invalid exam year id or syllabus id");
        }

        let syllabus = await prisma.syllabus.findFirst({
            where: exam_year_id ? { exam_year_id: exam_year_id } : { id: syllabusid },
            select: {
                SubjectSyllabusMap: {
                    select: {
                        subject: {
                            select: {
                                name: true,
                                shortName: true,
                            },
                        },
                        weightage: true,
                        TopicsSubjectMap: {
                            select: {
                                Topic: {
                                    select: {
                                        name: true,
                                        shortName: true,
                                    },
                                },
                            },
                        },
                    },
                },
                exam_year: {
                    select: {
                        year: true,
                        targetExam: {
                            select: {
                                shortCode: true,
                            },
                        },
                    },
                },
                created_at: true,
                id: true,
            },
        });

        if (!syllabus) throw Error("syllabus data not exist");

        let formated_syllabus: formatedSyllabus_type = {
            id: syllabus.id,
            subjects: [],
            created_at: syllabus.created_at.toISOString(),
            exam: syllabus?.exam_year?.targetExam.shortCode,
            examYear: syllabus?.exam_year?.year,
        };

        syllabus.SubjectSyllabusMap.forEach((subjectData) => {
            let data: fomatedSubject_type = {
                subject: subjectData.subject?.name || "",
                weightage: subjectData.weightage,
                topics: [],
            };

            if (!subjectData.subject?.name) throw Error("subject short name invalid");

            data.topics = subjectData.TopicsSubjectMap.map((topics) => {
                if (!topics.Topic.name) throw Error("topic short name invalid");
                return topics.Topic.name;
            });

            formated_syllabus.subjects.push(data);
        });

        return formated_syllabus;
    }
}
