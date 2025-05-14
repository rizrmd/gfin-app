import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "session",
  url: "/api/session",
  async handler(opt: { client_id: string }) {
    return await db.client.findFirst({ where: { id: opt.client_id } });
  },
});
