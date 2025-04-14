import WebSocket, { WebSocketServer } from "ws";
import { getQuizData } from "../src/controllers/bot.controller";


export const handleWebSocketConnection =(ws:WebSocket) =>{
    ws.on('message', async (data)=>{
        const message = JSON.parse(data.toString());
        let key = message.type
        let processedData 
        switch (key) {
            case "get-quiz-data":
                break;
            default: ws.send("i am ok!")
                break;
        }

        ws.send(JSON.stringify(processedData));
        console.log("data sended");
        
    })
}



