import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "permissions",
  url: "/api/permissions",
  async handler(arg: { id?: string; data?: any; action: "create" | "read" | "update" | "delete" }) {
    if (arg.action === "read") {
      if (arg.id) {
        return await db.permissions.findUnique({ where: { id: arg.id } });
      }
      return await db.permissions.findMany();
    } else if (arg.action === "create") {
      return await db.permissions.create({ data: arg.data });
    } else if (arg.action === "update") {
      return await db.permissions.update({ where: { id: arg.id }, data: arg.data });
    } else if (arg.action === "delete") {
      return await db.permissions.delete({ where: { id: arg.id } });
    }
  },
});