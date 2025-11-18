import z from "zod";

export const subcriptionPurchase_zod_schema = z.object({
  plan: z.string(),
  amount: z.string(),
//   time: z.string(),
})
