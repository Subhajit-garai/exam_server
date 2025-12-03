import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import Razorpay from "razorpay";
import "@repo/lib/cronJobs/index.js";
import { userauthenticate } from "@repo/lib/security/auth.js";


// routers
import { adminRouter } from "./routes/adminRouter.js";
import { IssueRouter } from "./routes/IssueRouter.js";
import { eventRouter } from "./routes/eventRouter.js";
import { paymentVerification } from "./controllers/payment.controller.js";
import { metrixRoute } from "./routes/metrix.route.js";
import { paymentRouter } from "./routes/paymentRouter.js";
import { botRouter } from "./routes/botRouter.js";
import { DataManageRouter } from "./routes/DataManageRouter.js";
import { examRouter } from "./routes/examRoutes.js";
import { questionRouter } from "./routes/questionsRoutes.js";
import { CommonuserRoutes } from "./routes/CommonuserRoutes.js";
import { noteRouter } from "./routes/noteRoute.js";
import { errorHandler } from "./middleware/globalErrorHandler.js";
import { syllabusRouter } from "./routes/syllabusRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { quizRouter } from "./routes/quiz.routes.js";




export const razerpayinstance = new Razorpay({
  key_id: process.env.RAZERPAY_API_KEY as string,
  key_secret: process.env.RAZERPAY_API_SECRET,
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

console.log("allowedOrigins", allowedOrigins);

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



app.use("/api/v1/user", CommonuserRoutes);
app.use("/api/v1/bot", botRouter);

app.use(userauthenticate);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/syllabus", syllabusRouter);
app.use("/api/v1/issue", IssueRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/notes", noteRouter);
app.use("/api/v1/metrix", metrixRoute);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/quiz", quizRouter);


app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`surver is listening on ${PORT}`);
});
