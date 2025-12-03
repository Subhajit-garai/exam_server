import WebSocket from "ws";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.Jwt_secret || "ahddhahdiai";

const token = jwt.sign({ id: "test-user-1", name: "Test User" }, jwtSecret);

const ws = new WebSocket(`ws://localhost:8080/quiz?token=${token}`);

ws.on("open", () => {
    console.log("Connected to WebSocket server");
    ws.send(JSON.stringify({ category: "QUIZ", type: "PING", payload: { message: "Hello" } }));
});

ws.on("message", (data) => {
    console.log("Received message:", data.toString());
    ws.close();
});

ws.on("close", () => {
    console.log("Disconnected from WebSocket server");
});

ws.on("error", (error) => {
    console.error("WebSocket error:", error);
});
