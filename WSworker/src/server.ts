import http from "http";
import "dotenv/config";
import { SocketManager } from "@/manager/socket.manager.js";
import { logger } from "./utils/logger.js";


const PORT = Number(process.env.WS_PORT);


const server = http.createServer();

server.on("request", (req, res) => {
    if (req.url === "/health") {
        res.end("OK");
    }
});

server.on("upgrade", (req, socket, head) => {
    logger.info(":UPGRADE REQUEST:");
});

// Initialize SocketManager
const socketManager = SocketManager.getInstance();
socketManager.init(server, "/quiz");

server.listen(PORT, "0.0.0.0", () => {
    logger.success(`WebSocket Worker listening on port ${PORT}`);
});
