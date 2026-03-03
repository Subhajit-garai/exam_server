import { Prisma } from "@repo/prisma/client.js"
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "@/lib/helper/logger.js";

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error("Global error:", err.message);
  let message = err instanceof Error ? err.message : "Unknown error";
  let statusCode = (err as CustomError).statusCode || 400;


  // Handle Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Example: Unique constraint failed
    if (err.code === "P2002") {
      statusCode = 400;
      message = `Duplicate value for field: ${err.meta?.target}`;
    }

    // Add more specific Prisma errors if needed
  }
  // Validation error (no .code)
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data or missing required fields";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
