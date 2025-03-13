import nodemailer, { Transporter } from "nodemailer";

class Mailer {
  private transporter: Transporter;

  constructor() {
    
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER as string, // Ensure it's a string
        pass: process.env.EMAIL_PASS as string,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER as string,
        to,
        subject,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export default Mailer;
