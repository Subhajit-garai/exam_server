import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { logger } from "@/utils/logger.js";

export class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log the full error object and stack trace in the console
  logger.error("Global error:", err.message);
  if (err.stack) console.error(err.stack); // This shows you the file and line number!
  // Log Postgres specific details if they exist
  if (err.detail) logger.error("DB Detail:", err.detail);
  if (err.code) logger.error("DB Error Code:", err.code);
  let message = err instanceof Error ? err.message : "Unknown error";


  let statusCode = (err as CustomError).statusCode || 400;
  res.status(statusCode).json({
    success: false,
    message,
  });
};