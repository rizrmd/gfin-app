import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "register",
  url: "/api/register",
  async handler(data: {
    loading: boolean;
    firstName: string;
    lastName: string;
    workEmail: string;
    password: string;
    orgName: string;
    state: string;
  }) {
    const { workEmail, password, firstName, lastName, orgName, state } = data;

    // Basic validation
    if (!workEmail || !password || !firstName || !orgName) {
      return { error: "Missing required fields", _status: 400 };
    }

    if (password.length < 8) {
      return {
        error: "Password must be at least 8 characters long",
        _status: 400,
      };
    }

    const saltRounds = 10;
    const hashedPassword = await Bun.password.hash(password);

    try {
      const newClient = await db.client.create({
        data: {
          email: workEmail,
          password: hashedPassword,
          profile: {
            firstName,
            lastName,
            orgName,
            state,
          },
          deleted_at: new Date(), // Added to satisfy schema requirement
        },
      });
      // Successfully created a new client

      return { id: newClient.id, email: newClient.email, _status: 201 };
    } catch (error: any) {
      console.error("Registration error:", error);
      // Check for unique constraint violation (e.g., email already exists)
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        return { error: "Email already exists", _status: 409 };
      }
      return { error: "Failed to create client", _status: 500 };
    }
  },
});
