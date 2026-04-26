import { WebSocket } from "ws";

export abstract class BaseSocketHandler {
    protected ws: WebSocket;
    protected user: any; // Type this properly if you have a User type

    constructor(ws: WebSocket, user: any) {
        this.ws = ws;
        this.user = user;
    }

    abstract handleMessage(type: string, payload: any): Promise<void>;

    protected send(type: string, payload: any) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }

    protected error(message: string) {
        this.send("ERROR", { message });
    }
}
