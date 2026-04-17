import Mailer from "./emailMeassenger.js";
import { logger } from "@/lib/helper/logger.js";
import {
    NotificationDispatcher, buildEmailNotification,
    SendEmailNotification, SendTelegramMessage,
    type NotificationPayload,
    buildTelegramNotification
} from "@subhajit60/notification-engine";
import { sendMessage } from "./telgramMessenger.js";



let mailer = new Mailer()
let telegram_message_sendfn = sendMessage

export const MessagerDispatcher = new NotificationDispatcher({
    email: new SendEmailNotification(mailer.sendHtmlMail.bind(mailer)),
    telegram: new SendTelegramMessage(telegram_message_sendfn)
})


let message = buildEmailNotification('token', 'success', "nakjsdaksbabbbaabjk.email", "Email Validation")
let message1 = buildTelegramNotification('token', 'success', "nakjsdaksbabbbaahajjhabjk.telegram", "Telegram Validation")


// dispatcher.dispatch(message, "garaisubhajit343@gmail.com")


type NotificationQueue = {
    payload: NotificationPayload,
    to: string | string[]
}

let EMAIL_ADDRESS = ["garaisubhajit343@gmail.com"]
let TELEGRAM_CHAT_ID = ["7057093987"]

let queue: NotificationQueue[] = [
    {
        payload: message,
        to: EMAIL_ADDRESS
    },
    {
        payload: message1,
        to: TELEGRAM_CHAT_ID
    }
]


const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

while (true) {

    logger.info("Waiting for job")
    await wait(2000);

    let job = queue.pop()

    logger.info("Job found", job)

    if (job) {
        if (Array.isArray(job.to)) {
            logger.info("Multiple recipients found", job.to)

            job.to.forEach(email => {
                MessagerDispatcher.dispatch(job.payload, email)
            })
        }
        else {
            logger.info("Single recipient found", job.to)
            MessagerDispatcher.dispatch(job.payload, job.to)
        }
    }

    logger.info("Job processed")

    await wait(5000);

}