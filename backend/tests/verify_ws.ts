import WebSocket from "ws";
import jwt from "jsonwebtoken";
import "dotenv/config";

// Mock token generation (replace secret with your actual env secret if needed, or use a known valid token)
// Assuming JWT_SECRET is in env
const secret = process.env.JWT_SECRET || "secret";
const token = jwt.sign({ id: "test_user_ws", role: "USER" }, secret, { expiresIn: "1h" });

const wsUrl = `ws://localhost:${process.env.PORT || 3000}?token=${token}`;

console.log(`Connecting to ${wsUrl}`);

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
    console.log("Connected to WebSocket");

    // Test Join Quiz
    console.log("Sending JOIN_QUIZ...");
    ws.send(JSON.stringify({
        category: "QUIZ",
        type: "JOIN_QUIZ",
        payload: { quizId: "quiz_123" }
    }));

    // Test Start Quiz
    setTimeout(() => {
        console.log("Sending START_QUIZ...");
        ws.send(JSON.stringify({
            category: "QUIZ",
            type: "START_QUIZ",
            payload: { quizId: "quiz_123" }
        }));
    }, 1000);

    // Test Submit Answer
    setTimeout(() => {
        console.log("Sending SUBMIT_ANSWER...");
        ws.send(JSON.stringify({
            category: "QUIZ",
            type: "SUBMIT_ANSWER",
            payload: { quizId: "quiz_123", questionId: "q1", answer: "A" }
        }));
    }, 2000);

    // Close after tests
    setTimeout(() => {
        ws.close();
        console.log("Test finished");
        process.exit(0);
    }, 3000);
});

ws.on("message", (data) => {
    console.log("Received:", data.toString());
});

ws.on("error", (err) => {
    console.error("WebSocket Error:", err);
    process.exit(1);
});

ws.on("close", (code, reason) => {
    console.log(`Disconnected: ${code} ${reason}`);
});
