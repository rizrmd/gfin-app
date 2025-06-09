import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "getOrgProfile", // Update the name to camelCase for API usage
  url: "/api/profile-org/get-org-profile",
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
