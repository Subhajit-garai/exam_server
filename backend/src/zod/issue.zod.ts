import { IssueType } from  "@repo/prisma/client";
import z from "zod"

export const IssueInpute_zod_type = z.object({
    type:z.nativeEnum(IssueType),
    note:z.string(),
    sub_type:z.string(),
    IssueDetails:z.object({
        id: z.string(),
    })
})