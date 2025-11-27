import { primeStatus, purchaseType } from "@repo/prisma/enums.js";
import z from "zod";

export const subcriptionPurchase_zod_schema = z.object({
  plan: z.nativeEnum(primeStatus),
  amount: z.string(),
  type: z.nativeEnum(purchaseType),
});

export const tokenPurchase_zod_schema = z.object({
  plan: z.nativeEnum(primeStatus),
  amount: z.string(),
  type: z.nativeEnum(purchaseType),
});
