import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "ai_session",
  url: "/api/ai/session",
  async handler(arg: {
    action: "create";
    data: { id_org: string; name: string; config: any; state: any };
  }) {
    const req = this.req!;
    switch (arg.action) {
      case "create": {
        const existing = await db.sessions.findFirst({
          where: {
            id_org: arg.data.id_org,
            status: "ongoing",
            name: arg.data.name,
          },
        });
        if (existing) {
          return { id: existing.id, state: existing.state };
        }

        const res = await db.sessions.create({
          data: {
            id_org: arg.data.id_org,
            name: arg.data.name,
            config: arg.data.config,
            state: arg.data.state,
          },
        });
        return { id: res.id, state: res.state };
      }
      default:
        throw new Error(`Unknown action: ${arg.action}`);
    }
  },
});
