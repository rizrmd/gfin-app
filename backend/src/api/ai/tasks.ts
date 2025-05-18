import { defineAPI } from "rlib/server";
import { AITaskStatus } from "shared/models";

export default defineAPI({
  name: "ai_tasks",
  url: "/api/ai/tasks",
  async handler(mode?: "unfinished") {
    const unfinishedTasks = await db.ai_task.findMany({
      where: {
        status:
          mode === "unfinished"
            ? {
                in: [AITaskStatus.PENDING, AITaskStatus.RUNNING],
              }
            : undefined,
      },
    });
    return unfinishedTasks;
  },
});
