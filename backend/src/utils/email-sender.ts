import * as fs from "fs";
import * as path from "path";
import { createTransport } from "nodemailer";
import { dir } from "rlib/server";

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * Send an email using the configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransport({
      host: "mail.gofunditnow.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@gofunditnow.com",
        pass: ",Cn@yfOE.W%O",
      },
    });

    await transporter.sendMail({
      from: "info@gofunditnow.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send OTP email using the OTP template
 */
export async function sendOTPEmail(
  email: string,
  otp: string
): Promise<boolean> {
  try {
    // Read HTML template
    const templatePath = dir.path("backend:src/template/email/otp-request.html");
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders
    htmlTemplate = htmlTemplate.replace("[[otp]]", otp);

    // Define button style
    const buttonStyle =
      "display:inline-block;background-color:#4F46E5;color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;line-height:20px;margin:0;padding:12px 24px;text-decoration:none;text-transform:none;border-radius:4px;";

    // Replace button style
    htmlTemplate = htmlTemplate.replace("[[aStyle]]", buttonStyle);

    // Replace verification URL
    const verificationUrl = `https://app.gofunditnow.com/verify-otp?otp=${otp}`;
    htmlTemplate = htmlTemplate.replace("[[url]]", verificationUrl);

    return await sendEmail({
      to: email,
      subject: "Your OTP Code for GoFundItNow",
      html: htmlTemplate,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

/**
 * Send welcome email to newly registered users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  try {
    // Read HTML template
    const templatePath = path.join(
      process.cwd(),
      "src/template/email/welcome-email.html"
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Replace name placeholder
    htmlTemplate = htmlTemplate.replace("[[name]]", name);

    return await sendEmail({
      to: email,
      subject: "Welcome to GoFundItNow!",
      html: htmlTemplate,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}
