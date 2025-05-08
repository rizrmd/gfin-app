import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "roles",
  url: "/api/roles",
  async handler(arg: { id?: string; data?: any; action: "create" | "read" | "update" | "delete" }) {
    if (arg.action === "read") {
      if (arg.id) {
        return await db.roles.findUnique({ where: { id: arg.id } });
      }
      return await db.roles.findMany();
    } else if (arg.action === "create") {
      return await db.roles.create({ data: arg.data });
    } else if (arg.action === "update") {
      return await db.roles.update({ where: { id: arg.id }, data: arg.data });
    } else if (arg.action === "delete") {
      return await db.roles.delete({ where: { id: arg.id } });
    }
  },
});