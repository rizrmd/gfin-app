import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "auth_logout",
  url: "/api/auth/logout",
  async handler(opt: { token: string }) {
    const { token } = opt;

    if (!token) {
      throw new Error("Token is required");
    }

    // Find and delete the session
    try {
      await db.auth_tokens.deleteMany({
        where: { token }
      });

      return {
        success: true,
        message: "Logged out successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to logout"
      };
    }
  },
});
