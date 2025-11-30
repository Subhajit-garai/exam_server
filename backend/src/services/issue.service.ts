import prisma from "@repo/db/index.js";
import { Status } from "@repo/prisma/client.js";

export class IssueService {
    async getQuestionIssueCount(id: string) {
        const response = await prisma.issue.count({
            where: {
                IssueDetails: {
                    equals: {
                        id: id,
                    },
                },
            },
        });
        return response;
    }

    async deleteIssue(id: string) {
        const isIssuePresent = await prisma.issue.findFirst({
            where: { id: id },
        });

        if (!isIssuePresent) throw new Error("This issue does not exist.");

        const response = await prisma.issue.delete({
            where: { id: id },
        });

        return response;
    }

    async updateStatus(id: string, status: Status) {
        const response = await prisma.issue.update({
            where: { id: id },
            data: { status: status },
        });
        return response;
    }

    async closeIssue(id: string) {
        const response = await prisma.issue.update({
            where: { id: id },
            data: { status: Status.Close },
        });
        return response;
    }

    async voteIssue(id: string, type: "up" | "down" | "priority") {
        const data: any = {};
        if (type === "up") data.upVote = { increment: 1 };
        if (type === "down") data.downVote = { increment: 1 };
        if (type === "priority") data.priorityVote = { increment: 1 };

        const response = await prisma.issue.update({
            where: { id: id },
            data: data,
        });
        return response;
    }

    async getIssueById(id: string) {
        const response = await prisma.issue.findFirst({
            where: { id: id },
        });
        if (!response) throw new Error("issue not found");
        return response;
    }

    async getAllIssues() {
        const response = await prisma.issue.findMany({});
        return response;
    }

    async createIssue(data: any, user: any, userRole: any) {
        const { type, note, IssueDetails, sub_type } = data;
        const response = await prisma.issue.create({
            data: {
                type,
                note,
                sub_type,
                IssueDetails,
                created_by: user,
                creator_role: userRole,
            },
        });
        return response;
    }

    async updateIssue(id: string, data: any, user: any, userRole: any) {
        const { type, note, IssueDetails } = data;
        const response = await prisma.issue.update({
            where: { id: id },
            data: {
                type,
                note,
                IssueDetails,
                created_by: user,
                creator_role: userRole,
            },
        });
        return response;
    }
}
