import { defineAPI } from "rlib/server";
import { generateSecureToken } from "../../lib/utils/generate-token";

export default defineAPI({
  name: "auth_verify_otp",
  url: "/api/auth/verify-otp",
  async handler(opt: {
    email: string;
    otp: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const { email, otp, userAgent, ipAddress } = opt;

    // if (!email || !otp) {
    //   throw new Error("Email and OTP are required");
    // }

    // Find the client with the given email
    const client = await db.clients.findFirst({
      where: { email },
    });

    if (!client) {
      throw new Error("User not found");
    }

    // Get the profile and extract OTP data
    const profile = (client.profile as any) || {};
    const otpData = profile.otp;

    if (!otpData) {
      throw new Error("No OTP request found");
    }

    // Verify OTP code
    if (otpData.otp !== otp) {
      throw new Error("Invalid OTP code");
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpData.expires_at);
    if (expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }

    // Clear OTP from profile
    delete profile.otp;
    await db.clients.update({
      where: { id: client.id },
      data: {
        profile
      }
    });

    // Generate a secure random token
    const token = generateSecureToken(48);

    // Set session expiration (7 days from now)
    const sessionExpiresAt = new Date();
    sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7);

    // Create a new session
    const session = await db.auth_tokens.create({
      data: {
        client_id: client.id,
        token,
        expires_at: sessionExpiresAt,
        user_agent: userAgent || null,
        ip_address: ipAddress || null,
      },
    });

    return {
      success: true,
      token: session.token,
      user: {
        id: client.id,
        email: client.email,
        profile: profile,
      },
    };
  },
});
