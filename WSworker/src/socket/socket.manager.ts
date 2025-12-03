import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "../common/token.js";
import { QuizSocketHandler } from "./handlers/quiz.socket.handler.js";
import { BaseSocketHandler } from "./handlers/base.socket.handler.js";
import { RedisProvider } from "../common/redisProvider.js";
import { User } from "./user.js";
import { Room } from "./room.js";

export class SocketManager {
    private static instance: SocketManager;
    private wss: WebSocketServer | null = null;
    private clients: Map<WebSocket, BaseSocketHandler[]> = new Map();
    private users: Map<string, User> = new Map();
    private rooms: Map<string, Room> = new Map();
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

    public init(server: Server, path?: string) {
        this.wss = new WebSocketServer({ server, path });

        this.wss.on("connection", async (ws: WebSocket, req: any) => {
            try {
                // 1. Authentication
                const url = new URL(req.url, `http://${req.headers.host}`);
                const token = url.searchParams.get("token");

                if (!token) {
                    ws.close(1008, "Token required");
                    console.log("Token required");
                    return;
                }

                let userData: any = {
                    id: token
                }

                // auth 

                // try {
                //     userData = verifyToken(token);

                //     if (typeof userData === 'string') {
                //         console.log("Invalid token payload");
                //         throw new Error("Invalid token payload");
                //     }
                // } catch (e) {
                //     console.log(" error ---> ", e);
                //     ws.close(1008, "Invalid token");
                //     return;
                // }

                console.log(`User connected: ${userData.id}`);

                // Store user mapping
                let user = this.users.get(userData.id);
                if (!user) {
                    user = new User(userData.id, userData, ws);
                    this.users.set(userData.id, user);
                } else {
                    user.addSocket(ws);
                }

                // 2. Initialize Handlers
                const quizHandler = new QuizSocketHandler(ws, userData);

                this.clients.set(ws, [quizHandler]);

                ws.on("message", async (message: string) => {
                    try {

                        const parsed = JSON.parse(message);
                        // console.log("Message received:", parsed);
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
                    } catch (error: any) {
                        console.error("Error processing message:", error);
                        ws.send(JSON.stringify({ type: "ERROR", payload: { message: error?.message ?? "Something went wrong" } }));
                    }
                });

                ws.on("close", (code, reason) => {

                    console.log(" connection close reason ---> ", reason);

                    console.log(`User disconnected: ${userData.id}`);
                    this.clients.delete(ws);

                    // Remove from user
                    if (user) {
                        user.removeSocket(ws);
                        if (user.getSocketCount() === 0) {
                            this.users.delete(userData.id);
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
            const user = this.users.get(userId);
            if (user) {
                user.send(type, payload);
            }
        });
    }

    public getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    public createRoom(roomId: string): Room {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = new Room(roomId);
            this.rooms.set(roomId, room);
        }
        return room;
    }

    public deleteRoom(roomId: string) {
        this.rooms.delete(roomId);
    }
}
