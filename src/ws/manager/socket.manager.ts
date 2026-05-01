import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "@/utils/token.js";
import { QuizSocketHandler } from "../handlers/quiz.socket.handler.js";
import { BaseSocketHandler } from "../handlers/base.socket.handler.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { User } from "../user.js";
import { Room } from "../room.js";
import { logger } from "@/utils/logger.js";
import { BotUserService } from "@/services/bot/bot.user.service.js";

export class SocketManager {
    private static instance: SocketManager;
    private wss: WebSocketServer | null = null;
    private clients: Map<WebSocket, BaseSocketHandler[]> = new Map();
    private users: Map<string, User> = new Map();
    private rooms: Map<string, Room> = new Map();
    private redisSub: any;

    private constructor() {
        const manager = RedisManager.getInstance();
        this.redisSub = manager.getclient().duplicate();

        this.redisSub.subscribe("WS_BROADCAST", (err: any, count: number) => {
            if (err) {
                logger.error("Failed to subscribe: %s", err.message);
            } else {
                logger.success(`Subscribed successfully! Currently subscribed to ${count} channels.`);
            }
        });

        this.redisSub.on("message", (channel: string, message: string) => {
            if (channel === "WS_BROADCAST") {
                try {
                    const { userIds, type, payload, rooms } = JSON.parse(message);
                    this.broadcast(userIds || [], type, payload, rooms);
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


    // public init(port: number, path: string = "/quiz") {
    // this.wss = new WebSocketServer({ port, path });
    // logger.info(`SocketManager initialized on port ${port} with path ${path}`);
    public init(server: any, path: string = "/quiz") {
        this.wss = new WebSocketServer({ server, path });
        logger.info(`SocketManager initialized on existing server with path ${path}`);

        const hbInterval = setInterval(() => {
            if (!this.wss) return;
            this.wss.clients.forEach((ws: any) => {
                if (ws.isAlive === false) return ws.terminate();
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);

        this.wss.on("close", () => clearInterval(hbInterval));

        this.wss.on("connection", async (ws: WebSocket, req: any) => {
            (ws as any).isAlive = true;
            ws.on("pong", () => (ws as any).isAlive = true);

            try {
                const url = new URL(req.url, `http://${req.headers.host}`);
                const token = url.searchParams.get("token");

                if (!token) {
                    ws.close(1008, "Token required");
                    return;
                }

                let userinfo;
                try {
                    userinfo = verifyToken(token);
                } catch (e) {
                    ws.close(1008, "Invalid token");
                    return;
                }

                let user = this.users.get(userinfo.id);
                if (!user) {
                    const botUserService = new BotUserService();
                    const userData = await botUserService.getuserInfo(userinfo.id);
                    user = new User(userinfo.id, userData, ws);
                    this.users.set(userinfo.id, user);
                } else {
                    user.addSocket(ws);
                }

                const quizHandler = new QuizSocketHandler(ws, user);
                this.clients.set(ws, [quizHandler]);

                ws.on("message", async (message: string | Buffer) => {
                    try {
                        const parsed = JSON.parse(message.toString());
                        const { category, type, payload } = parsed;
                        const handlers = this.clients.get(ws);
                        if (handlers) {
                            for (const handler of handlers) {
                                if (handler instanceof QuizSocketHandler && (category === "QUIZ" || !category)) {
                                    await handler.handleMessage(type, payload);
                                }
                            }
                        }
                    } catch (error: any) {
                        ws.send(JSON.stringify({ type: "ERROR", payload: { message: error?.message ?? "Something went wrong" } }));
                    }
                });

                ws.on("close", () => {
                    this.clients.delete(ws);
                    if (user) {
                        user.removeSocket(ws);
                        if (user.getSocketCount() === 0) this.users.delete(userinfo.id);
                    }
                });

            } catch (error) {
                ws.close(1011, "Internal Server Error");
            }
        });
    }

    public broadcast(userIds: string[], type: string, payload: any, rooms?: string[]) {
        let handled = false;
        if (rooms && Array.isArray(rooms)) {
            rooms.forEach(roomId => {
                const room = this.rooms.get(roomId);
                if (room) { room.broadcast(type, payload); handled = true; }
            });
        }
        if (handled) return;

        userIds.forEach(userId => {
            const user = this.users.get(userId);
            if (user) user.send(type, payload);
        });
    }

    public joinRoom(roomId: string, user: User) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = new Room(roomId);
            this.rooms.set(roomId, room);
        }
        room.addUser(user);
    }

    public leaveRoom(roomId: string, user: User) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.removeUser(user);
            if (room.getUserCount() === 0) this.rooms.delete(roomId);
        }
    }
}
