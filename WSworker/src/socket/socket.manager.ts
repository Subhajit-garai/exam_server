import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "../common/token.js";
import { QuizSocketHandler } from "./handlers/quiz.socket.handler.js";
import { BaseSocketHandler } from "./handlers/base.socket.handler.js";
import { RedisProvider } from "../common/redisProvider.js";

export class SocketManager {
    private static instance: SocketManager;
    private wss: WebSocketServer | null = null;
    private clients: Map<WebSocket, BaseSocketHandler[]> = new Map();
    private userClients: Map<string, WebSocket[]> = new Map();
    private redisSub: any;

    private constructor() {
        // Initialize Redis Subscriber
        const provider = RedisProvider.getInstance();
        // We need a duplicate connection for subscription because it blocks
        this.redisSub = provider.getclient().duplicate();

        this.redisSub.subscribe("WS_BROADCAST", (err: any, count: number) => {
            if (err) {
                console.error("Failed to subscribe: %s", err.message);
            } else {
                console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        this.redisSub.on("message", (channel: string, message: string) => {
            if (channel === "WS_BROADCAST") {
                try {
                    const { userIds, type, payload } = JSON.parse(message);
                    this.broadcast(userIds, type, payload);
                } catch (error) {
                    console.error("Error processing Redis message:", error);
                }
            }
        });
    }

    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public init(server: Server) {
        this.wss = new WebSocketServer({ server });

        this.wss.on("connection", async (ws: WebSocket, req: any) => {
            try {
                // 1. Authentication
                // Extract token from query params or headers
                // Example: ws://localhost:3000?token=...
                const url = new URL(req.url, `http://${req.headers.host}`);
                const token = url.searchParams.get("token");

                if (!token) {
                    ws.close(1008, "Token required");
                    return;
                }

                let user: any;
                try {
                    user = verifyToken(token);
                    if (typeof user === 'string') {
                        // Handle string case if needed, or assume object
                        throw new Error("Invalid token payload");
                    }
                } catch (e) {
                    ws.close(1008, "Invalid token");
                    return;
                }

                console.log(`User connected: ${user.id}`);

                // Store user mapping
                if (!this.userClients.has(user.id)) {
                    this.userClients.set(user.id, []);
                }
                this.userClients.get(user.id)?.push(ws);

                // 2. Initialize Handlers
                // We can have multiple handlers per connection if needed, 
                // or route based on message "category".
                // For now, let's attach a QuizHandler.
                const quizHandler = new QuizSocketHandler(ws, user);

                this.clients.set(ws, [quizHandler]);

                ws.on("message", async (message: string) => {
                    try {
                        const parsed = JSON.parse(message);
                        const { category, type, payload } = parsed;

                        // Route to appropriate handler
                        const handlers = this.clients.get(ws);
                        if (handlers) {
                            for (const handler of handlers) {
                                // Simple routing: if category matches or if we just broadcast to all handlers
                                // Here assuming QuizHandler handles everything for now or we check category
                                if (handler instanceof QuizSocketHandler && (category === "QUIZ" || !category)) {
                                    await handler.handleMessage(type, payload);
                                }
                            }
                        }
                    } catch (error) {
                        console.error("Error processing message:", error);
                        ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Invalid message format" } }));
                    }
                });

                ws.on("close", () => {
                    console.log(`User disconnected: ${user.id}`);
                    this.clients.delete(ws);

                    // Remove from userClients
                    const userSockets = this.userClients.get(user.id);
                    if (userSockets) {
                        const index = userSockets.indexOf(ws);
                        if (index > -1) {
                            userSockets.splice(index, 1);
                        }
                        if (userSockets.length === 0) {
                            this.userClients.delete(user.id);
                        }
                    }
                });

            } catch (error) {
                console.error("Connection error:", error);
                ws.close(1011, "Internal Server Error");
            }
        });

        console.log("WebSocket Server Initialized");
    }

    public broadcast(userIds: string[], type: string, payload: any) {
        userIds.forEach(userId => {
            const sockets = this.userClients.get(userId);
            if (sockets) {
                sockets.forEach(ws => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type, payload }));
                    }
                });
            }
        });
    }
}
