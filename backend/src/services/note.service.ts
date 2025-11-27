import prisma from "@repo/db/index.js";

export class NoteService {
    async like(topicId: string) {
        // Note: The original controller logic had a bug where `topicid` was hardcoded to "".
        // I am assuming the intention was to use the topicId passed to the function.
        // However, the original code used `topicid` variable which was initialized to "".
        // I will use the passed topicId, but this might need verification if the original code was intentionally broken or incomplete.
        // Wait, looking at the original code:
        // const { subject, topic } = req.params;
        // let topicid = "";
        // ... where: { id: topicid } ...
        // It seems the original code was indeed incomplete as it didn't fetch the topic ID from the slug 'topic'.
        // I will implement the logic to find the topic by slug first if needed, or assume the controller passes the ID.
        // The controller receives `subject` and `topic` (slugs).
        // So I should probably look up the topic by slug first.

        // Actually, to keep it simple and reusable, I'll let the controller handle the slug-to-id resolution if possible,
        // OR I can implement the slug resolution here.
        // Let's implement the slug resolution here as it's part of the business logic "like a topic".
        // But wait, the original code was:
        // let topicid = "";
        // ...
        // where: { id: topicid }
        // This would definitely fail or return nothing.
        // I will try to fix this by looking up the topic by slug.

        // Re-reading the original code:
        // const { subject, topic } = req.params;
        // ...
        // let topicid = "";
        // ...
        // let topicData = await tx.topic.findFirst({ where: { id: topicid } });
        // This is definitely broken in the original code.
        // I will try to find the topic by slug.

        // However, to be safe and strictly follow "refactor", I should probably replicate the logic, but since it's broken, I should fix it.
        // I will assume the input is the topic slug.

        // Wait, `topic` in params is likely the slug.
        // I will search by slug.

        // Actually, looking at `getTopic` in controller:
        // const topicid = req.query.topicid;
        // ... where: { id: topicid }
        // So sometimes it uses ID.

        // In `like` controller: `const { subject, topic } = req.params;`
        // These are likely slugs.

        // I will implement `likeBySlug` or similar.

        // Let's look at the transaction logic. It creates a version backup and then updates the like count.

        // I will implement `likeTopic(topicSlug: string)`

        const topicData = await prisma.topic.findFirst({
            where: { slug: topicId }, // Assuming topicId passed here is the slug from params
        });

        if (!topicData) throw new Error("Topic data not found in database");

        return await prisma.$transaction(async (tx) => {
            let createAnotherVersion = await tx.topicNoteVersion.create({
                data: {
                    topicId: topicData.id,
                    content: topicData.content,
                    version: topicData.version,
                    attachments: topicData.attachments,
                },
            });
            if (!createAnotherVersion)
                throw new Error("error while create a version backup");

            let updatedContent = await tx.topic.update({
                where: {
                    id: topicData.id,
                },
                data: {
                    like: {
                        increment: 1,
                    },
                },
            });

            return updatedContent;
        });
    }

    async dislike(topicSlug: string) {
        const topicData = await prisma.topic.findFirst({
            where: { slug: topicSlug },
        });

        if (!topicData) throw new Error("Topic data not found in database");

        return await prisma.$transaction(async (tx) => {
            let createAnotherVersion = await tx.topicNoteVersion.create({
                data: {
                    topicId: topicData.id,
                    content: topicData.content,
                    version: topicData.version,
                    attachments: topicData.attachments,
                },
            });
            if (!createAnotherVersion)
                throw new Error("error while create a version backup");

            let updatedContent = await tx.topic.update({
                where: {
                    id: topicData.id,
                },
                data: {
                    dislike: {
                        increment: 1,
                    },
                },
            });

            return updatedContent;
        });
    }

    async updateContentOfTopic(topicId: string, newContent: any) {
        return await prisma.$transaction(async (tx) => {
            let topicData = await tx.topic.findFirst({
                where: {
                    id: topicId,
                },
            });

            if (!topicData) throw new Error("Topic data not found in database");
            let createAnotherVersion = await tx.topicNoteVersion.create({
                data: {
                    topicId: topicData.id,
                    content: topicData.content,
                    version: topicData.version,
                    attachments: topicData.attachments,
                },
            });
            if (!createAnotherVersion)
                throw new Error("error while create a version backup");

            let updatedContent = await tx.topic.update({
                where: {
                    id: topicId,
                },
                data: {
                    content: newContent,
                    version: {
                        increment: 1,
                    },
                },
            });

            return updatedContent;
        });
    }

    async createTopic(data: any) {
        let subject = await prisma.topic.create({
            data: {
                ...data,
            },
        });
        return subject;
    }

    async deleteSubject(id: string) {
        let isExist = await prisma.subject.findFirst({
            where: {
                id: id,
            },
        });

        if (!isExist) throw new Error("Subject is not present ");

        let subject = await prisma.subject.delete({
            where: {
                id: id,
            },
        });
        return subject;
    }

    async createSubject(data: any) {
        let subject = await prisma.subject.create({
            data: {
                ...data,
            },
        });
        return subject;
    }

    async getAllVersionOfNote(topicSlug: string) {
        let topicdata = await prisma.topic.findFirst({
            where: {
                slug: topicSlug,
            },
        });

        if (!topicdata) throw new Error("Topic not found");

        let versions = await prisma.topicNoteVersion.findMany({
            where: {
                topicId: topicdata.id, // Corrected from `id: topicdata.id` which was likely wrong in original code if searching versions by topicId
            },
        });
        // Original code: where: { id: topicdata?.id }
        // This seems wrong for finding versions OF a topic. It should be topicId.
        // I will assume `topicId` is the foreign key in `topicNoteVersion`.
        // Checking original code again:
        // let versions = await prisma.topicNoteVersion.findMany({ where: { id: topicdata?.id } });
        // This looks like a bug in the original code, searching for a version with the same ID as the topic?
        // Or maybe `id` in `topicNoteVersion` is the topicId? Unlikely.
        // I will use `topicId` as it's the standard FK name and used in `create` above.

        return versions;
    }

    async getAllNoteTopic(slug: string) {
        let subjectdata = await prisma.subject.findFirst({
            where: {
                slug: slug,
            },
        });

        if (!subjectdata) throw new Error("Subject not found");

        let topicdatas = await prisma.topic.findMany({
            where: {
                subjectId: subjectdata.id,
            },
            select: {
                id: true,
                order: true,
                name: true,
                shortName: true,
                description: true,
                created_at: true,
                updated_at: true,
                slug: true,
                iconUrl: true,
                color: true,
                isPublic: true,
                status: true,
                subjectId: true,
                isparentTopic: true,
                parentTopicId: true,
                tags: true,
                // content:true,
                like: true,
                dislike: true,
                readCount: true,
                comments: true,
                commentEnabled: true,
                verified: true,
                estimatedReadTime: true,
                version: true,
                attachments: true,
                publishedAt: true,
                language: true,
                createdBy: true,
                updatedBy: true,
            },
        });
        return topicdatas;
    }

    async getAllNoteSubject() {
        let subjectdatas = await prisma.subject.findMany({});
        return subjectdatas;
    }

    async getTopic(topicId: string) {
        let note = await prisma.topic.findFirst({
            where: {
                id: topicId,
            },
            select: {
                content: true,
                name: true,
                order: true,
                description: true,
                slug: true,
                tags: true,
                like: true,
                dislike: true,
                readCount: true,
                isPublic: true,
                estimatedReadTime: true,
                version: true,
                attachments: true,
                status: true,
            },
        });
        return note;
    }

    async getNote(subjectSlug: string, topicSlug: string) {
        let note = await prisma.topic.findFirst({
            where: {
                slug: topicSlug,
                subject: {
                    slug: subjectSlug,
                },
            },
            select: {
                content: true,
                name: true,
                order: true,
                description: true,
                slug: true,
                tags: true,
                like: true,
                dislike: true,
                readCount: true,
                isPublic: true,
                estimatedReadTime: true,
                version: true,
                attachments: true,
                status: true,
            },
        });
        return note;
    }
}
