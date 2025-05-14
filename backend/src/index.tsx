import { $ } from "bun";
import { dir, initDev, initEnv, initProd } from "rlib/server";
import { agent } from "./lib/ws/agent";

if (!dir.exists("shared:models")) {
  await $`bun i`.cwd(dir.path("shared:"));
  await $`bun prisma generate`.cwd(dir.path("shared:"));
}
const { isDev } = initEnv();

const loadModels = async () => {
  return new (await import("shared/models")).PrismaClient();
};
const loadApi = async () => {
  return (await import("./gen/api")).backendApi;
};
const index = (await import("frontend/entry/index.html")).default;

if (isDev) {
  initDev({
    index,
    loadApi,
    loadModels,
    ws: { agent },
  });
} else {
  const config = await import("../../config.json");
  initProd({
    index,
    loadApi,
    loadModels,
    config,
    ws: { agent },
  });
}
