import {
  APIError,
  betterAuth,
  generateId,
  type Account,
  type BetterAuthOptions,
} from "better-auth";
import { Pool } from "pg";
import { username, twoFactor, openAPI } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { randomUUIDv7 } from "bun";

const sendEmail = async (to: string, subject: string, text: string) => {
  // const transporter = nodemailer.createTransport({
  //   service: "Gmail",
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
  // const mailOptions = {
  //   from: process.env.EMAIL_USER,
  //   to,
  //   subject,
  //   text,
  // };
  // await transporter.sendMail(mailOptions);
};

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: () => randomUUIDv7(),
    },
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Reset Password",
        `Click here to reset your password: ${url}`
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const veritifacationUrl = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${process.env.EMAIL_VERIFICATION_CALLBACK_URL}`;
      await sendEmail(
        user.email,
        "Email Verification",
        `Click here to verify your email: ${veritifacationUrl}`
      );
    },
    expiresIn: 3600, // 1 hour
  },
  socialProviders: {
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // },
    // facebook: {
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    //   scopes: ["email", "public_profile", "user_friends"], // Overwrites permissions
    //   fields: ["id", "name", "email", "picture", "user_friends"], // Extending list of fields
    // },
  },
  trustedOrigins: [
    "http://localhost:7500",
    "http://localhost:8100",
    "http://localhost:8500",
  ],
  plugins: [
    openAPI(), // /api/auth/refernce
    username(),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }, request) {
          if (!otp) throw new Error("OTP not found");
          if (!request) throw new Error("Request not found");
          if (!request.headers) throw new Error("Request headers not found");
          const host = request.headers.get("host");
          if (!host) throw new Error("Host not found");
          const url = `https://${host}/auth/verify-otp?otp=${otp}`;
          const subject = "Your OTP Code";
          const text = `Hello ${user.name},\n\nYour OTP code is: ${otp}\n\nClick here to verify: ${url}`;
          await sendEmail(user.email, subject, text);
        },
      },
    }),
  ],
  session: {
    modelName: "session",
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    modelName: "verification",
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["email-password", "google", "facebook"],
    },
    modelName: "user",
    fields: {
      userId: "id_user_role",
      accountId: "username",
      providerId: "id_provider",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      idToken: "id_token",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  user: {
    modelName: "user_role",
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  // databaseHooks: {
  //   user: {
  //     create: {
  //       async before(data, context) {
  //         data.id = randomUUIDv7();
  //         return { data };
  //       },
  //     },
  //   },
  // },
});

export const utils = {
  mapping: {
    table: (name: string) => {
      if (name === "user") return "user_role";
      else if (name === "account") return "user";
      else return name;
    },
    column: {
      session: ({
        userId,
        expiresAt,
        ipAddress,
        userAgent,
        createdAt,
        updatedAt,
      }: {
        userId: string;
        expiresAt: string;
        ipAddress: string;
        userAgent: string;
        createdAt: string;
        updatedAt: string;
      }) => ({
        user_id: userId,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: createdAt,
        updated_at: updatedAt,
      }),
      verification: ({
        expiresAt,
        createdAt,
        updatedAt,
      }: {
        expiresAt: string;
        createdAt: string;
        updatedAt: string;
      }) => ({
        expires_at: expiresAt,
        created_at: createdAt,
        updated_at: updatedAt,
      }),
      account: ({
        userId,
        accountId,
        providerId,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        idToken,
        createdAt,
        updatedAt,
      }: {
        userId: string;
        accountId: string;
        providerId: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresAt: string;
        refreshTokenExpiresAt: string;
        idToken: string;
        createdAt: string;
        updatedAt: string;
      }) => ({
        user_role_id: userId,
        username: accountId,
        id_provider: providerId,
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expires_at: accessTokenExpiresAt,
        refresh_token_expires_at: refreshTokenExpiresAt,
        id_token: idToken,
        created_at: createdAt,
        updated_at: updatedAt,
      }),
      user: ({
        emailVerified,
        createdAt,
        updatedAt,
        displayUsername,
        twoFactorEnabled,
      }: {
        emailVerified: string;
        createdAt: string;
        updatedAt: string;
        displayUsername: string;
        twoFactorEnabled: string;
      }) => ({
        email_verified: emailVerified,
        created_at: createdAt,
        updated_at: updatedAt,
        display_username: displayUsername,
        two_factor_enabled: twoFactorEnabled,
      }),
    },
  },
  signInEmail: async ({
    email,
    password,
    rememberMe = false,
    callbackURL = "/dashboard",
  }: {
    email: string;
    password: string;
    rememberMe?: boolean;
    callbackURL?: string;
  }): Promise<Response> => {
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
        rememberMe,
        callbackURL,
      },
      asResponse: true,
    });
    return response;
  },
  getSession: async (headers: Headers) => {
    const response = await auth.api.getSession({
      headers,
    });
    return {
      session: {
        ...response?.session,
        user_id: response?.session.userId,
        expires_at: response?.session.expiresAt,
        ip_address: response?.session.ipAddress,
        user_agent: response?.session.userAgent,
        created_at: response?.session.createdAt,
        updated_at: response?.session.updatedAt,
      },
      user_role: {
        ...response?.user,
        email_verified: response?.user.emailVerified,
        created_at: response?.user.createdAt,
        updated_at: response?.user.updatedAt,
        display_username: response?.user.displayUsername,
        two_factor_enabled: response?.user.twoFactorEnabled,
      },
    };
  },
};
