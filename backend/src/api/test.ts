import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "test",
  url: "/api/test",
  async handler() {
    const req = this.req!;
    console.log("route: " + "/api/test");
    return {
      hello: "world",
    };
  },
});
