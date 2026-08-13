import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import Razorpay from "razorpay";
import "@/lib/event/index.js";
import { isAdmin, userauthenticate } from "@/lib/security/auth.js";

// routers from app modules
import { adminRouter } from "./app/admin/route.js";
import { IssuePublicRouter } from "./app/issue/route.js";
import { paymentVerification } from "./app/payment/controller.js";
import { metrixRoute } from "./app/metrix/route.js";
import { paymentRouter } from "./app/payment/route.js";
import { examPublicRouter, examPatternPublicRouter } from "./app/exam/route.js";
import {
  questionPublicRouter,
  questionProcessingPublicRouter,
} from "./app/question/route.js";
import { CommonuserRoutes, userRouter } from "./app/user/route.js";
import { notePublicRouter } from "./app/note/route.js";
import { errorHandler } from "./middleware/globalErrorHandler.js";
import { syllabusPublicRouter } from "./app/syllabus/route.js";
import { quizRouter } from "./app/quiz/route.js";
import { statsRouter } from "./app/stats/route.js";
import { categoryPublicRouter } from "./app/category/route.js";
import { progressRouter } from "./app/progress/route.js";
import { logger } from "@/utils/logger.js";

// import { SocketManager } from "./ws/manager/socket.manager.js";

// import "./worker.js";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("❌ Razorpay keys missing in environment variables");
}

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID?.trim() || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim() || "",
});

export const app = express();
// const server = http.createServer(app);

const trustProxy = process.env.TRUST_PROXY || 1;
app.set("trust proxy", trustProxy);
const PORT = process.env.PORT || 3000;

let allowedOriginsstr = process.env.ALLOWED_ORIGINS;
const allowedOrigins = allowedOriginsstr?.split(",") || [
  "http://localhost:3002",
  "http://localhost:3004",
];

logger.info("allowedOrigins", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error("Not allowed by CORS")); // Reject the origin
      }
    },
    credentials: true, // Enable credentials
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.send({ message: "i'm healthy now,after you ask" });
});

// inportent , it is veryfy and access server
app.post("/api/v1/payment/paymentverification", paymentVerification);

app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/user", CommonuserRoutes);
app.use("/api/v1/category", categoryPublicRouter);

app.use(userauthenticate);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/syllabus", syllabusPublicRouter);
app.use("/api/v1/issue", IssuePublicRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/notes", notePublicRouter);
app.use("/api/v1/metrix", metrixRoute);
app.use("/api/v1/exam", examPublicRouter);
app.use("/api/v1/exampattern", examPatternPublicRouter);
app.use("/api/v1/question", questionPublicRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/question-processing", questionProcessingPublicRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/admin", isAdmin, adminRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.success(`server is listening on ${PORT}`);
});

// // Initialize SocketManager after server starts listening
// const socketManager = SocketManager.getInstance();
// socketManager.init(server, "/ws/quiz");
// (global as any).socketManager = socketManager;
