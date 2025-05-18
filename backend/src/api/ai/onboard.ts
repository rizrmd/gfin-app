import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "ai_onboard",
  url: "/api/ai/onboard",
  async handler(org: {
    id: string;
    mode: "update" | "status";
    questions?: any;
    data?: any;
    onboard?: { qa: boolean; profile: boolean };
  }) {
    const req = this.req!;

    try {
      // If org id exists, update the organization
      if (org.id) {
        if (org.mode === "update") {
          const updatedOrg = await db.organizations.update({
            where: { id: org.id },
            data: {
              data: org.data,
              questions: org.questions || {},
              onboard: org.onboard || { profile: false, org: false },
            },
          });

          return { success: true, organization: updatedOrg };
        } else {
          // If mode is "get", fetch the organization
          const organization = await db.organizations.findUnique({
            where: { id: org.id },
            select: { onboard: true, questions: true },
          });

          if (!organization) {
            return { success: false, error: "Organization not found" };
          }

          return { success: true, organization };
        }
      }
    } catch (error: any) {
      console.error("Error saving organization:", error);
      return {
        success: false,
        error: `Failed to save organization: ${error.message}`,
      };
    }
  },
});
