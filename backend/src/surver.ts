import express from "express";
import { examRouter } from "./routes/examRoutes.js";
import { questionRouter } from "./routes/questionsRoutes.js";
import { CommonuserRoutes } from "./routes/CommonuserRoutes.js";
import cookieParser from "cookie-parser";
import { userauthenticate } from "../lib/auth.js";
import cors from "cors";

import { DataManageRouter } from "./routes/DataManageRouter.js";
import { userRouter } from "./routes/userRouter.js";
import Razorpay from "razorpay";
import { metrixRoute } from "./routes/metrix.route.js";
import { paymentRouter } from "./routes/paymentRouter.js";
import { botRouter } from "./routes/botRouter.js";

import "../lib/cronJobs/index"
export const razerpayinstance = new Razorpay({
  key_id: process.env.RAZERPAY_API_KEY as string,
  key_secret: process.env.RAZERPAY_API_SECRET,
});

export const app = express();
app.set('trust proxy', 'loopback')
const PORT = process.env.PORT || 3000;

// app.use(
//   cors({
//     origin: ["http://localhost:3002", "http://localhost:3004",],
//     credentials: true,
//   })
// );


let  allowedOriginsstr = process.env.ALLOWED_ORIGINS
const allowedOrigins = allowedOriginsstr?.split(",") || ["http://localhost:3002", "http://localhost:3004",]

console.log("allowedOrigins",allowedOrigins);


app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or mobile apps)
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


// "https://api.razorpay.com"

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 

app.use("/api/v1/bulk", DataManageRouter); // bulk insert

app.get("/health",(req,res)=> {res.json({ message: "i'm healthy now after you ask"})})

app.use("/api/v1/user", CommonuserRoutes);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/bot",botRouter)


app.use(userauthenticate);
app.use("/api/v1/user", userRouter);


app.use("/api/v1/metrix", metrixRoute);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/question", questionRouter);

app.listen(PORT, () => {
  console.log(`surver is listening on ${PORT}`);
});
