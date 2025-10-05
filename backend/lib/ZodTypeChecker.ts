import { SafeParseReturnType, ZodError } from "zod";

export const ZodDataSafeParse = <T>(
  result: SafeParseReturnType<T, T>,
  allMessages = false
): Error => {
  if (result.success) return new Error(""); // or handle success separately

  const error: ZodError = result.error;
  let errMessage = "";

  if (allMessages) {
    errMessage = error.errors.map((e) => e.message).join(", ");
  } else {
    errMessage = error.errors[0]?.message || "Validation error";
  }

  return new Error(errMessage);
};
