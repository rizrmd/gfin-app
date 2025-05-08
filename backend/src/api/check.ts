import { defineAPI } from "rlib/server";

export default defineAPI({
  name: "check",
  url: "/api/check",
  async handler(arg: { nama: string }) {
    return {
      halo: arg.nama,
    };
  },
});
