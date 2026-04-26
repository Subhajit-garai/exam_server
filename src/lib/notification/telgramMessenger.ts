import axios from "axios";
import { logger } from "@/utils/logger.js";


let MESSAGER_TOKEN = process.env.TELEGRAM_MESSAGER_BOT_TOKEN;
let url = `https://api.telegram.org/bot${MESSAGER_TOKEN}/sendMessage`;

export const sendMessage = async (
  chat_id: string,
  message: string // html or markdown
) => {
  try {
    let sendedMessage = await axios.post(url, {
      chat_id: parseInt(chat_id),
      text: message,
      parse_mode: "HTML", // for markdown and html
    });

    if (sendedMessage.status === 200) {
      logger.success("Message sent");
      let id = sendedMessage?.data?.result?.message_id;
      return id;
    }
  } catch (error) {
    logger.error("Error sending Telegram message:", error);
  }

  return false;
};

// sendMessage(7057093987,"hi there i'm messaging bot!") // testing
