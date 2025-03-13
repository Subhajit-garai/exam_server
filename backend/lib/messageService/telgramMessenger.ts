import axios from "axios"

let MESSAGER_TOKEN = process.env.TELEGRAM_MESSAGER_BOT_TOKEN
let url =`https://api.telegram.org/bot${MESSAGER_TOKEN}/sendMessage`



export const  sendMessage_HtmlParse = async (chat_id:number ,message:string) =>{
    let sendedMessage = await axios.post(url, {
        chat_id: chat_id,
        text: message,
        parse_mode: "HTML"  // for markdown and html
    })

    if(sendedMessage.status === 200){
        console.log("sended message");
        let id = sendedMessage?.data?.result?.message_id        
        return id ;
    }
    return false;
}


export const  sendMessage = async (chat_id:number ,message:string) =>{
    let sendedMessage = await axios.post(url, {
        chat_id: chat_id,
        text: message
    })

    if(sendedMessage.status === 200){
        console.log("sended message");
        let id = sendedMessage?.data?.result?.message_id        
        return id ;
    }
    return false;
}


// sendMessage(7057093987,"hi there i'm messaging bot!") // testing

