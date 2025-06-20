import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "auth_verify_session",
  url: "/api/auth/verify-session",
  async handler(opt: { token: string }) {
    const { token } = opt;

    if (!token) {
      throw new Error("Token is required");
    }

    // Find the session with the given token
    const session = await db.auth_tokens.findFirst({
      where: { token },
      include: {
        clients: {
          include: { organizations: true },
        },
      },
    });

    if (!session) {
      throw new Error("Invalid session token");
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete the expired session
      await db.auth_tokens.delete({
        where: { id: session.id },
      });
      throw new Error("Session has expired");
    }

    // Extend session expiration time
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    // Update the session expiration
    await db.auth_tokens.update({
      where: { id: session.id },
      data: {
        expires_at: newExpiresAt,
        updated_at: new Date(),
      },
    });

    // Return user data
    const client = session.clients;
    return {
      success: true,
      user: {
        id: client.id,
        email: client.email,
        profile: client.profile,
      },
      organization: client.organizations[0],
    };
  },
});
