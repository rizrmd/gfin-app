import { defineAPI } from "rlib/server";
import type { blankOrg } from "shared/lib/client_state";
import { generateSecureToken } from "../../lib/utils/generate-token";
import { sendWelcomeEmail } from "../../utils/email-sender";

export default defineAPI({
  name: "register",
  url: "/api/register",
  async handler(data: {
    loading: boolean;
    firstName: string;
    lastName: string;
    workEmail: string;
    password?: string; // Added password field
    orgName: string;
    orgWebsite: string; // Added orgWebsite field
  }) {
    const { workEmail, firstName, lastName, orgName, password, orgWebsite } =
      data;

    if (!workEmail || !firstName || !lastName || !orgName) {
      throw new Error("All fields are required.");
    }

    const exists = await db.clients.findFirst({
      where: { email: workEmail },
      include: {
        organizations: true,
      },
    });
    if (exists) {
      return {
        success: true,
        message: "Client and organization loaded successfully.",
        client: {
          id: exists.id,
          email: exists.email,
          profile: exists.profile,
        },
        organization: {
          id: exists.organizations[0]!.id,
          name: exists.organizations[0]!.name,
          data: exists.organizations[0]!.data,
        },
      };
    }

    const hashedPassword = password
      ? Bun.password.hashSync(password, "argon2id")
      : null;

    try {
      // Create the client
      const newClient = await db.clients.create({
        data: {
          email: workEmail,
          password: hashedPassword,
          profile: {
            firstName,
            lastName,
          },
        },
      });

      // Create the organization
      const newOrganization = await db.organizations.create({
        data: {
          id_client: newClient.id,
          name: orgName,
          data: {
            entityInformation: {
              entityName: orgName,
              entityWebsite: orgWebsite,
            },
          } as typeof blankOrg, // Default empty data
          questions: {}, // Default empty questions
        },
      });

      // Generate a secure random token for automatic login
      const token = generateSecureToken(48);
      
      // Set session expiration (7 days from now)
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7);
      
      // Get user agent safely
      const req = this.req!;
      const userAgent = req.headers.get("user-agent") || null;
      
      // Create a new session for automatic login
      const session = await db.sessions.create({
        data: {
          client_id: newClient.id,
          token,
          expires_at: sessionExpiresAt,
          user_agent: userAgent,
        }
      });

      // Send welcome email asynchronously (don't await to speed up response)
      sendWelcomeEmail(workEmail, firstName).catch(err => {
        console.error("Error sending welcome email:", err);
      });

      return {
        success: true,
        message: "Client and organization registered successfully.",
        token: session.token, // Include the session token for automatic login
        client: {
          id: newClient.id,
          email: newClient.email,
          profile: newClient.profile,
        },
        organization: {
          id: newOrganization.id,
          name: newOrganization.name,
          data: newOrganization.data,
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      // Consider more specific error handling based on Prisma error codes
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002" &&
        "meta" in error &&
        typeof error.meta === "object" &&
        error.meta !== null &&
        "target" in error.meta &&
        Array.isArray(error.meta.target) &&
        error.meta.target.includes("email")
      ) {
        throw new Error("A client with this email already exists.");
      }
      throw new Error("Failed to register client and organization.");
    }
  },
});
