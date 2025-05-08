import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "users",
  url: "/api/users",
  async handler(arg: { id?: string; data?: any; action: "create" | "read" | "update" | "delete" }) {
    if (arg.action === "read") {
      if (arg.id) {
        return await db.users.findUnique({ where: { id: arg.id } });
      }
      return await db.users.findMany();
    } else if (arg.action === "create") {
      return await db.users.create({ data: arg.data });
    } else if (arg.action === "update") {
      return await db.users.update({ where: { id: arg.id }, data: arg.data });
    } else if (arg.action === "delete") {
      return await db.users.delete({ where: { id: arg.id } });
    }
  },
});
