import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "ai_onboard",
  url: "/api/ai/onboard",
  async handler(org: {
    id: string;
    id_client?: string;
    questions?: any;
    data: any;
    onboard?: { profile: boolean; org: boolean };
  }) {
    const req = this.req!;
    
    try {
      // If org id exists, update the organization
      if (org.id) {
        const updatedOrg = await db.organizations.update({
          where: { id: org.id },
          data: {
            data: org.data,
            questions: org.questions || {},
            onboard: org.onboard || { profile: false, org: false }
          }
        });
        
        return { success: true, organization: updatedOrg };
      } 
      // If no org id but client id exists, create a new organization
      else if (org.id_client) {
        const newOrg = await db.organizations.create({
          data: {
            id_client: org.id_client,
            name: org.data.name || "New Organization",
            data: org.data,
            questions: org.questions || {},
            onboard: org.onboard || { profile: false, org: false }
          }
        });
        
        return { success: true, organization: newOrg };
      } else {
        return { 
          success: false, 
          error: "Cannot save organization: missing id or id_client" 
        };
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      return { 
        success: false, 
        error: `Failed to save organization: ${error.message}` 
      };
    }
  },
});
