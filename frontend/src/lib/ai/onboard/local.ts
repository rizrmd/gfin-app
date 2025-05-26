import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import type { useAI } from "../use-ai";
import { localzip } from "../localzip";

export const aiOnboardLocal = ({
  questions,
  ai,
}: {
  questions: string[];
  ai: ReturnType<typeof useAI>;
}) => {
  const local = {
    messages: [] as { message: string; source: "user" | "ai"; ts: number }[],
    permission: "pending" as "pending" | "requesting" | "granted" | "denied",
    start: () => {},
    queried: false,
    qa_user: {} as Record<string, string>,
    qa_final: {} as Record<string, string>,
    qa_done: false,
    mode: "" as "" | "manual" | "auto",
    chooseMode: (mode: "manual" | "auto") => {},
    phase: {
      qa: false,
      profile: false,
    },
    paused: false,
    resume: () => {
      local.paused = false;
      local.render();
    },
    pause: () => {
      local.paused = true;
      local.render();
    },
    summary: false,
    render: () => {},
  };

  return local;
};
