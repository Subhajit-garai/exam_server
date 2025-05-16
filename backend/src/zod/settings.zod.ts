import z from "zod";

export const appConfigSetting_zodSchema = z.object({
  feature: z.string(),
  status: z.boolean().transform(val => val ? 'open' : 'close')
});
