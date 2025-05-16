import { $ } from "bun";
import { dir, initDev, initEnv, initProd } from "rlib/server";
import { ws_ai } from "./lib/ws/ai";
import { resumeTasksOnStartup } from "./ai/lib/task-main";
import { initializeTaskRegistry } from "./ai/tasks/registry"; // Import the registry initializer

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
    ws: { ai: ws_ai },
    onStart: async () => {
      initializeTaskRegistry(); // Initialize registry first
      await resumeTasksOnStartup();
    }
  });
} else {
  const config = await import("../../config.json");
  initProd({
    index,
    loadApi,
    loadModels,
    config,
    ws: { ai: ws_ai },
    onStart: async () => {
      initializeTaskRegistry(); // Initialize registry first
      await resumeTasksOnStartup();
    }
  });
}
