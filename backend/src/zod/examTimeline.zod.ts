import { z } from "zod";
import { ExamStatus } from "@repo/prisma/enums.js";

export const CreateExamTimelineSchema = z.object({
    title: z.string().min(1, "Title is required"),
    date: z.string().datetime().or(z.date()), // Accept ISO string or Date object
    description: z.string().optional(),
    status: z.nativeEnum(ExamStatus),
    notification: z.string().optional(),
    exam_year: z.string().uuid("Invalid Exam Year ID"),
});

export const UpdateExamTimelineSchema = z.object({
    title: z.string().min(1).optional(),
    date: z.string().datetime().or(z.date()).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(ExamStatus).optional(),
    notification: z.string().optional(),
    exam_year: z.string().uuid().optional(),
});
