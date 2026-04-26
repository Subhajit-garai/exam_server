import nodemailer, { Transporter } from "nodemailer";
import { logger } from "@/utils/logger.js";

class Mailer {
  private transporter: Transporter;

  constructor() {

    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER?.trim() as string, // Ensure it's a string
        pass: process.env.EMAIL_PASS?.trim() as string,
      },
    });
  }



  async sendHtmlMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER?.trim() as string,
        to: to,
        subject: subject,
        html: html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.success("Email sent:", info.response);
    } catch (error) {
      logger.error("Error sending email:", error);
      throw error;
    }
  }
}

export default Mailer;

