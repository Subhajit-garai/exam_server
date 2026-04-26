import Mailer from "./emailMeassenger.js";
import {
    NotificationDispatcher,
    SendEmailNotification, SendTelegramMessage,
} from "@subhajit60/notification-engine";
import { sendMessage } from "./telgramMessenger.js";



let mailer = new Mailer()
let telegram_message_sendfn = sendMessage

export const MessageDispatcher = new NotificationDispatcher({
    email: new SendEmailNotification(mailer.sendHtmlMail.bind(mailer)),
    telegram: new SendTelegramMessage(telegram_message_sendfn)
})
