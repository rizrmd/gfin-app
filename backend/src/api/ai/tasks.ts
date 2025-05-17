import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "ai_tasks",
  url: "/api/ai/tasks",
  async handler() {
    const req = this.req!;
    console.log("route: " + "/api/ai/tasks");
    return {};
  },
});
