import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import Razorpay from "razorpay";
import "@repo/lib/cronJobs/index.js";
import { isAdmin, userauthenticate } from "@repo/lib/security/auth.js";


// routers
import { adminRouter } from "./routes/adminRouter.js";
import { IssuePublicRouter } from "./routes/IssueRouter.js";

import { paymentVerification } from "./controllers/payment.controller.js";
import { metrixRoute } from "./routes/metrix.route.js";
import { paymentRouter } from "./routes/paymentRouter.js";
import { botRouter } from "./routes/bot/botRouter.js";
import { DataManageRouter } from "./routes/DataManageRouter.js";
import { examPublicRouter } from "./routes/examRoutes.js";
import { examPatternPublicRouter } from "./routes/examPattern.routes.js";
import { questionPublicRouter } from "./routes/questionsRoutes.js";
import { CommonuserRoutes } from "./routes/CommonuserRoutes.js";
import { notePublicRouter } from "./routes/noteRoute.js";
import { errorHandler } from "./middleware/globalErrorHandler.js";
import { syllabusPublicRouter } from "./routes/syllabusRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { quizRouter } from "./routes/quiz.routes.js";
import { questionProcessingPublicRouter } from "./routes/questionprocessing.routes.js";
import { statsRouter } from "./routes/statsRoutes.js";
import { categoryPublicRouter } from "./routes/category.routes.js";
import { progressRouter } from "./routes/progress.routes.js";
import { logger } from "./lib/helper/logger.js";



if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("❌ Razorpay keys missing in environment variables");
}

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID?.trim() || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim() || "",
});

export const app = express();
const server = http.createServer(app);
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
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));




app.get("/health", (req, res) => {
  res.send({ message: "i'm healthy now,after you ask" });
});

app.use("/api/v1/bulk", DataManageRouter); // bulk insert
// inportent , it is veryfy and access survece
app.post("/api/v1/payment/paymentverification", paymentVerification);



app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/bot", botRouter);
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

server.listen(PORT, () => {
  logger.success(`server is listening on ${PORT}`);
});
