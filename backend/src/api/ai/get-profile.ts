import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "ai_get-profile",
  url: "/api/ai/get-profile",
  async handler(arg: { organizationId: string }) {
    const org = await db.organizations.findUnique({
      where: { id: arg.organizationId },
      select: {
        id: true,
        data: true
      }
    });

    if (!org) {
      throw new Error("Organization not found");
    }
    return {
      id: org.id,
      data: org.data
    };
  },
});
