import express from "express";
import { examRouter } from "./routes/examRoutes.js";
import { questionRouter } from "./routes/questionsRoutes.js";
import { CommonuserRoutes } from "./routes/CommonuserRoutes.js";
import cookieParser from "cookie-parser";
import { userauthenticate } from "../lib/auth.js";
import { handleWebSocketConnection } from "../lib/WebSocket.js";
import cors from "cors";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

import { DataManageRouter } from "./routes/DataManageRouter.js";
import { userRouter } from "./routes/userRouter.js";
import Razorpay from "razorpay";
import { metrixRoute } from "./routes/metrix.route.js";
import { paymentRouter } from "./routes/paymentRouter.js";
import { botRouter } from "./routes/botRouter.js";

import "../lib/cronJobs/index";
import { verifyToken } from "../lib/token.js";
import { URLSearchParams } from "url";
import { adminRouter } from "./routes/adminRouter.js";
import { IssueRouter } from "./routes/IssueRouter.js";
import { eventRouter } from "./routes/eventRouter.js";
import { paymentVerification } from "./controllers/payment.controller.js";
export const razerpayinstance = new Razorpay({
  key_id: process.env.RAZERPAY_API_KEY as string,
  key_secret: process.env.RAZERPAY_API_SECRET,
});

export const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface AuthenticatedWebSocket extends WebSocket {
  user?: any; // Extend WebSocket to include 'user'
}

// app.set("trust proxy", "loopback");
const trustProxy = process.env.TRUST_PROXY || 1;

app.set('trust proxy', trustProxy);

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

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



app.use("/api/v1/bulk", DataManageRouter); // bulk insert

// inportent , it is veryfy and access survece 

app.post("/api/v1/payment/paymentverification", paymentVerification);


app.get("/health", (req, res) => {
  res.json({ message: "i'm healthy now after you ask" });
});

app.use("/api/v1/user", CommonuserRoutes);
app.use("/api/v1/bot", botRouter);

app.use(userauthenticate);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/issue", IssueRouter);
app.use("/api/v1/event", eventRouter);
app.use("/api/v1/user", userRouter);

app.use("/api/v1/metrix", metrixRoute);
app.use("/api/v1/exam", examRouter);
app.use("/api/v1/question", questionRouter);



// webscocket server 
// wss.on("connection", (ws:AuthenticatedWebSocket,req) => {
//  // ws auth
//   const url = req?.url || "";
//   const queryString = url.includes("?") ? url.split("?")[1] : "";
//   const urlParams = new URLSearchParams(queryString);

//   const token = urlParams.get("token");

//   if (!token) {
//     ws.send(JSON.stringify({ error: "No token provided" }));
//     ws.close();
//     return;
//   }

//   let decoded = verifyToken(token)
//   if (!decoded) {
//     ws.send(JSON.stringify({ error: "Invalid token" }));
//     ws.close();
//     return;
//   }
//   ws.user = decoded
  
//    // message handling
//   handleWebSocketConnection(ws);
// });

server.listen(PORT, () => {
  console.log(`surver is listening on ${PORT}`);
});
