import { db } from "@repo/db/index.js";
import { issues } from "@repo/db/schema/issue.js";
import { Status, UserRole } from "@repo/db/schema/enums.js";
import { eq, sql, count } from "drizzle-orm";

export class IssueService {
    async getQuestionIssueCount(id: string) {
        const [result] = await db.select({ value: count() })
            .from(issues)
            .where(sql`${issues.issue_details}->>'id' = ${id}`);
        return result?.value || 0;
    }

    async deleteIssue(id: string) {
        const [isIssuePresent] = await db.select({ id: issues.id }).from(issues).where(eq(issues.id, id));
        if (!isIssuePresent) throw new Error("This issue does not exist.");

        const [response] = await db.delete(issues).where(eq(issues.id, id)).returning();
        return response;
    }

    async updateStatus(id: string, status: typeof Status.enumValues[number]) {
        const [response] = await db.update(issues)
            .set({ status })
            .where(eq(issues.id, id))
            .returning();
        return response;
    }

    async closeIssue(id: string) {
        const [response] = await db.update(issues)
            .set({ status: "Close" })
            .where(eq(issues.id, id))
            .returning();
        return response;
    }

    async voteIssue(id: string, type: "up" | "down" | "priority") {
        const set: Record<string, any> = {};
        if (type === "up") set.up_vote = sql`${issues.up_vote} + 1`;
        else if (type === "down") set.down_vote = sql`${issues.down_vote} + 1`;
        else if (type === "priority") set.priority_vote = sql`${issues.priority_vote} + 1`;

        const [response] = await db.update(issues)
            .set(set)
            .where(eq(issues.id, id))
            .returning();
        return response;
    }

    async getIssueById(id: string) {
        const [response] = await db.select().from(issues).where(eq(issues.id, id));
        if (!response) throw new Error("issue not found");
        return response;
    }

    async getAllIssues() {
        return await db.select().from(issues);
    }

    async createIssue(data: any, user: string, userRole: typeof UserRole.enumValues[number]) {
        const { type, note, IssueDetails, sub_type } = data;
        const [response] = await db.insert(issues).values({
            type,
            note,
            sub_type: sub_type || "General",
            issue_details: IssueDetails,
            created_by: user,
            creator_role: userRole,
            up_vote: 0,
            down_vote: 0,
            priority_vote: 0,
        }).returning();
        return response;
    }

    async updateIssue(id: string, data: any, user: string, userRole: typeof UserRole.enumValues[number]) {
        const { type, note, IssueDetails } = data;
        const [response] = await db.update(issues)
            .set({
                type,
                note,
                issue_details: IssueDetails,
                created_by: user,
                creator_role: userRole,
            })
            .where(eq(issues.id, id))
            .returning();
        return response;
    }
}

export const issueService = new IssueService();
