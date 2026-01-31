import http from "http";
import "dotenv/config";
import { SocketManager } from "@repo/socket/socket.manager.js";


const PORT = process.env.WS_PORT || 8080;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket Worker is running\n');
});

// Initialize SocketManager
const socketManager = SocketManager.getInstance();
socketManager.init(server, "/quiz");

server.listen(PORT, () => {
    console.log(`WebSocket Worker listening on port ${PORT}`);
});
