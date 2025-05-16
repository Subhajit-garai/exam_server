import { IssueType } from "@prisma/client"
import z from "zod"

export const IssueInpute_zod_type = z.object({
    type:z.nativeEnum(IssueType),
    note:z.string(),
    IssueDetails:z.object({
        id: z.string(),
        title: z.string().optional(),
        topic: z.string().optional(),
        option: z.array(z.string()).optional(),
        ans: z.array(z.string()).optional(),
    })
})