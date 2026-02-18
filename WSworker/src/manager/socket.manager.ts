import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { verifyToken } from "@/utils/token.js";
import { QuizSocketHandler } from "@/handlers/quiz.socket.handler.js";
import { BaseSocketHandler } from "@/handlers/base.socket.handler.js";
import { RedisProvider } from "@/utils/redisProvider.js";
import { User } from "@/user.js";
import { Room } from "@/room.js";
import { Network } from "@repo/utils/network.js";
import { logger } from "@/utils/logger";


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
                logger.error("Failed to subscribe: %s", err.message);
            } else {
                logger.success(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
            }
        });

        this.redisSub.on("message", (channel: string, message: string) => {
            if (channel === "WS_BROADCAST") {
                try {
                    const { userIds, type, payload, rooms } = JSON.parse(message);
                    this.broadcast(userIds, type, payload, rooms);
                } catch (error) {
                    logger.error("Error processing Redis message:", error);
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
        logger.info("SocketManager initialized");
        this.wss.on("connection", async (ws: WebSocket, req: any) => {

            logger.info("New connection establishing");
            try {
                // 1. Authentication
                const url = new URL(req.url, `http://${req.headers.host}`);
                const token = url.searchParams.get("token");

                if (!token) {
                    ws.close(1008, "Token required");
                    logger.error("Token required! , token not found ");
                    return;
                }
                let userinfo: any
                // auth 
                try {
                    userinfo = verifyToken(token);
                    if (typeof userinfo === 'string') {
                        logger.error("Invalid token payload");
                        throw new Error("Invalid token payload");
                    }
                } catch (e) {
                    logger.error(" error ---> ", e);
                    ws.close(1008, "Invalid token");
                    return;
                }

                // Store user mapping
                let user = this.users.get(userinfo.id);


                if (!user) {
                    let network = Network.getInstance()
                    let responce = await network.getuserInfo(userinfo.id)
                    if (responce) {
                        logger.success("User data fetched successfully");
                    } else {
                        logger.error("User data not found");
                        ws.close(1008, "User data not found");
                        return;
                    }
                    user = new User(userinfo.id, responce, ws);

                    this.users.set(userinfo.id, user);
                } else {
                    user.addSocket(ws);
                }
                // 2. Initialize Handlers
                const quizHandler = new QuizSocketHandler(ws, user);
                this.clients.set(ws, [quizHandler]);


                ws.on("message", async (message: string | Buffer) => {

                    try {

                        const parsed = JSON.parse(message.toString());

                        console.log("-----> ", parsed);

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
                    logger.error(`User disconnected: ${userinfo.id}`);
                    logger.error("RESON:", reason.toString())
                    this.clients.delete(ws);

                    // Remove from user
                    if (user) {
                        user.removeSocket(ws);
                        if (user.getSocketCount() === 0) {
                            this.users.delete(userinfo.id);
                        }
                    }
                });

            } catch (error) {
                console.error("Connection error:", error);
                ws.close(1011, "Internal Server Error");
            }
        });
    }

    public broadcast(userIds: string[], type: string, payload: any, rooms?: string[]) {
        let handled = false;

        // Support explicit rooms array (Top Level)
        if (rooms && Array.isArray(rooms)) {
            rooms.forEach((roomId: string) => {
                const room = this.rooms.get(roomId);
                if (room) {
                    room.broadcast(type, payload);
                    handled = true;
                }
            });
        }

        // Support explicit rooms array (In Payload - Legacy support if needed, but top level is preferred now)
        if (payload && Array.isArray(payload.rooms)) {
            payload.rooms.forEach((roomId: string) => {
                const room = this.rooms.get(roomId);
                if (room) {
                    room.broadcast(type, payload);
                    handled = true;
                }
            });
        }

        // Support implicit room via quizId (Legacy/Convenience)
        if (payload && payload.quizId) {
            const room = this.rooms.get(payload.quizId);
            if (room) {
                room.broadcast(type, payload);
                handled = true;
            }
        }

        // If handled via room, do we still want to send to individual userIds? 
        if (handled) return;

        userIds.forEach(userId => {
            const user = this.users.get(userId);
            if (user) {
                user.send(type, payload);
            }
        });
    }


    public joinRoom(roomId: string, user: User) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = new Room(roomId);
            this.rooms.set(roomId, room);
            logger.info(`[ROOM_CREATE] Created room ${roomId}`);
        }
        room.addUser(user);
        logger.success(`[ROOM_JOIN] User ${user.id} joined room ${roomId}`);
    }

    public leaveRoom(roomId: string, user: User) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.removeUser(user);
            logger.success(`[ROOM_LEAVE] User ${user.id} left room ${roomId}`);
            if (room.getUserCount() === 0) {
                this.rooms.delete(roomId);
                logger.success(`[ROOM_DELETE] Deleted empty room ${roomId}`);
            }
        }
    }
}
