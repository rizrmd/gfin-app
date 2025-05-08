import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "hallo",
  url: "/api/hallo/:id",
  async handler() {
    const req = this.req!;
    console.log("route: " + "/api/hallo" + req.params.id);
    return {
      halo: "habib",
      id: req.params.id,
    };
  },
});
