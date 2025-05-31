import { defineAPI } from "rlib/server";
// import db from "path-to-your-db-client"; // sesuaikan dengan path DB Anda

export default defineAPI({
  name: "get_client_with_organization",
  url: "/api/auth/user-data",
  async handler(opt: { question: string }) {
    const session = this.req?.session;

    if (!session || !session.user || !session.user.email) {
      throw new Error("Unauthorized");
    }

    const userEmail = session.user.email;
    const question = opt.question;

    // Ambil client berdasarkan email
    const client = await db.clients.findFirst({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        profile: true,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }

    // Ambil data organization berdasarkan id_client dan question
    const organizations = await db.organization.findMany({
      where: {
        id_client: client.id,
        question: question, // pastikan tipe data sesuai (string/object)
      },
      select: {
        data: true,
      },
    });

    return {
      email: client.email,
      profile: client.profile,
      organizations: organizations.map(org => org.data),
    };
  },
});
