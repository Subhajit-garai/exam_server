import { WebSocket } from "ws";

export type user_data = {
    avatar?: string | null,
    name: string
}
export class User {
    public id: string;
    public data: user_data;
    private sockets: WebSocket[] = [];

    constructor(id: string, data: user_data, ws: WebSocket) {
        this.id = id;
        this.data = data;
        this.sockets.push(ws);
    }

    public addSocket(ws: WebSocket) {
        if (!this.sockets.includes(ws)) {
            this.sockets.push(ws);
        }
    }

    public removeSocket(ws: WebSocket) {
        const index = this.sockets.indexOf(ws);
        if (index > -1) {
            this.sockets.splice(index, 1);
        }
    }

    public getSocketCount(): number {
        return this.sockets.length;
    }

    public send(type: string, payload: any) {
        this.sockets.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type, payload }));
            }
        });
    }

    public disconnect() {
        this.sockets.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        });
        this.sockets = [];
    }
}
