import { IssueType } from "@/db/enums.js";
import z from "zod";

export const IssueInpute_zod_type = z.object({
  type: z.enum(IssueType.enumValues),
  note: z.string(),
  sub_type: z.string().optional(),
  IssueDetails: z.object({
    id: z.string(),
  }),
});
