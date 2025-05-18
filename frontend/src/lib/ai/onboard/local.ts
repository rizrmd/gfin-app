import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import type { useAI } from "../use-ai";

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
    qa_session: {} as Record<string, string>,
    phase: {
      qa: false,
      profile: false,
    },
    render: () => {},
    storeQA: async () => {
      const res = (await ai.task.do("ask", {
        prompt: `that will generate a message in this json format: [{q: "the question ?", a: "the answer"}] do not output invalid json, exclude your thought. Only add entries when the question is one of the questions in the list: ${JSON.stringify(
          questions
        )}
                    
                    This is our last conversation: ${JSON.stringify(
                      local.messages
                    )}, and this is current question and answer: ${JSON.stringify(
          local.qa_session
        )}`,
      })) as unknown as { q: string; a: string }[];

      if (Array.isArray(res)) {
        const qa = {};
        for (const e of res) {
          if (e.q && e.a && questions.indexOf(e.q) >= 0) {
            qa[e.q] = e.a;
          }
        }
        local.qa_session = qa;
        local.render();

        if (user.organization.id) {
          if (Object.keys(local.qa_session).length === questions.length) {
            local.phase.qa = true;
          }

          api.ai_onboard({
            mode: "update",
            id: user.organization.id,
            questions: qa,
            onboard: local.phase,
          });
        }
      }
    },
  };

  return local;
};
