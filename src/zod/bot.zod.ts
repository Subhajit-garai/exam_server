import { z } from "zod";

export const banuser_notification_zod_type = z.object({
    user_id: z.string().or(z.number()),
    chat_id: z.string().or(z.number()),
    ban_from_type: z.string(),
});

export const unbanuser_notification_zod_type = z.object({
    user_id: z.string().or(z.number()),
    chat_id: z.string().or(z.number()),
});
