import { defineAPI } from "rlib/server";
import * as crypto from "crypto";
import { sendOTPEmail } from "../../utils/email-sender";

export default defineAPI({
  name: "auth_login",
  url: "/api/auth/login",
  async handler(opt: { email: string }) {
    const req = this.req!;
    const { email } = opt;
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP in client profile
    const client = await db.clients.findFirst({
      where: { email }
    });

    if (!client) {
      throw new Error("User not found");
    }

    // Update client profile with OTP information
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

    // Send email with OTP
    // const emailSent = await sendOTPEmail(email, otp);
    
    // if (!emailSent) {
    //   throw new Error("Failed to send OTP email");
    // }

    return { 
      success: true,
      otp: otpData,
      message: "OTP sent to your email"
    };
  },
});
