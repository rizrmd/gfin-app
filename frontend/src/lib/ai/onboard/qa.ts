import { user } from "@/lib/user";
import { localzip } from "../localzip";
import type { aiOnboardLocal } from "./local";
import type { useAI } from "../use-ai";
import type { useConversation } from "@11labs/react";

export const onboardQA = async ({
  local,
  conv,
  ai,
  questions,
}: {
  local: ReturnType<typeof aiOnboardLocal>;
  conv: ReturnType<typeof useConversation>;
  ai: ReturnType<typeof useAI>;
  questions: string[];
}) => {
  const qa_session = localzip.get("gfin-ai-qa-session");
  if (qa_session !== null) {
    for (const question in qa_session) {
      local.qa_session[question] = qa_session[question];
    }
  }

  const gfin_msgs = localzip.get("gfin-ai-msgs");
  const user_name = `${user.client.profile!.firstName} ${
    user.client.profile!.lastName
  }`;

  let firstMessage: undefined | string = undefined;
  if (gfin_msgs !== null) {
    if (gfin_msgs.length >= 2) {
      const res = await ai.task.do("ask", {
        prompt: `\
These are our last conversation: ${JSON.stringify(gfin_msgs)}. 

Do your best to summarize our last conversation in a single sentence, ignore chit-chat or greetings from our last conversation. Greet me (${user_name}) with that summary.
`,
        system: `You are ARTEMIS, an assistant that will generate a message in this json format: { answer: string }`,
      });

      if (res.answer) {
        firstMessage = res.answer;
      }

      for (const message of gfin_msgs) {
        local.messages.push({
          message: message.message,
          source: message.source,
          ts: message.ts,
        });
      }

      local.messages.push({
        message: res.answer,
        source: "ai",
        ts: Date.now(),
      });
      local.render();
    }
  }

  const textQuestions = questions
    .map((e, idx) => `${idx + 1}. ${e.replace(/"/g, "'")}`)
    .join("\n ");

  conv.startSession({
    agentId: "agent_01jvcrfcp1ere9ys6m72dejez9",
    dynamicVariables: {
      user_name,
      org_name: user.organization.data!.entityInformation.entityName,
      state: user.organization.data!.filingInformation.state,
      questions: textQuestions,
    },
    overrides: firstMessage
      ? {
          agent: {
            firstMessage,
          },
        }
      : undefined,
    clientTools: {
      answer: async (params) => {
        local.qa_session[params.question] = params.answer;
        localzip.set("gfin-ai-qa-session", local.qa_session);
        local.render();
      },
    },
    onMessage(props) {
      local.messages.push({ ...props, ts: Date.now() });
      local.render();
      if (local.messages.find((e) => e.source === "user")) {
        localzip.set("gfin-ai-msgs", local.messages);
      }
    },
    onError(message, context) {
      console.error("Error in conversation", message, context);
    },
    onDisconnect() {
      local.storeQA();
    },
  });
};
