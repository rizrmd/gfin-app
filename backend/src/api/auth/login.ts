import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "auth_login",
  url: "/api/auth/login",
  async handler(opt: { email: string }) {
    const req = this.req!;
    return {};
  },
});
