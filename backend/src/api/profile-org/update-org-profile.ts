import { defineAPI } from "rlib/server";
import type { OrganizationData } from "shared/lib/client_state";

export default defineAPI({
  name: "profile-org_update-org-profile",
  url: "/api/profile-org/update-org-profile",
  async handler(arg: { data: OrganizationData, orgId: string, userId: string }) {
    try {
      // Update the organization data in the database, ensuring both org ID and client ID match
      const updatedOrg = await db.organizations.update({
        where: { 
          id: arg.orgId,
          id_client: arg.userId
        },
        data: {
          data: arg.data,
        },
      });

      return {
        success: true,
        message: "Organization profile updated successfully",
        data: updatedOrg.data
      };
    } catch (error) {
      console.error("Error updating organization profile:", error);
      return {
        success: false,
        message: "Failed to update organization profile",
        error: (error as Error).message
      };
    }
  },
});
