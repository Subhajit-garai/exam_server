import http from "http";
import dotenv from "dotenv";
import { SocketManager } from "./socket/socket.manager.js";

dotenv.config();

const PORT = process.env.WS_PORT || 8080;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket Worker is running\n');
});

// Initialize SocketManager
const socketManager = SocketManager.getInstance();
socketManager.init(server);

server.listen(PORT, () => {
    console.log(`WebSocket Worker listening on port ${PORT}`);
});
