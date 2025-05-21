import { defineAPI } from "rlib/server";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { createTransport } from "nodemailer";

export default defineAPI({
  name: "auth_resend_otp",
  url: "/api/auth/resend-otp",
  async handler(opt: { email: string }) {
    const { email } = opt;
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Generate a new 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Find client
    const client = await db.clients.findFirst({
      where: { email }
    });

    if (!client) {
      throw new Error("User not found");
    }

    // Update client profile with new OTP information
    const profile = client.profile as any || {};
    const otpData = {
      otp,
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
      created_at: new Date()
    };
    
    await db.clients.update({
      where: { id: client.id },
      data: {
        profile: {
          ...profile,
          otp: otpData
        }
      }
    });

    // Send email with new OTP
    await sendOTPEmail(email, otp);

    return { 
      success: true,
      message: "New OTP sent to your email"
    };
  },
});

async function sendOTPEmail(email: string, otp: string) {
  try {
    // Read HTML template
    const templatePath = path.join(process.cwd(), 'src/template/email/otp-request.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    
    // Replace placeholders
    htmlTemplate = htmlTemplate.replace('[[otp]]', otp);
    
    // Define button style
    const buttonStyle = "display:inline-block;background-color:#4F46E5;color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;line-height:20px;margin:0;padding:12px 24px;text-decoration:none;text-transform:none;border-radius:4px;";
    
    // Replace button style
    htmlTemplate = htmlTemplate.replace('[[aStyle]]', buttonStyle);
    
    // Replace verification URL
    const verificationUrl = `https://app.gofunditnow.com/verify-otp?otp=${otp}`;
    htmlTemplate = htmlTemplate.replace('[[url]]', verificationUrl);
    
    // Configure email transporter
    const transporter = createTransport({
      host: "mail.gofunditnow.com",
      port: 465,
      secure: true,
      auth: {
        user: "info@gofunditnow.com",
        pass: ",Cn@yfOE.W%O"
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: "info@gofunditnow.com",
      to: email,
      subject: "Your New OTP Code for GoFundItNow",
      html: htmlTemplate
    });
    
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
}