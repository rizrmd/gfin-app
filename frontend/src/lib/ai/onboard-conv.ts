import { useConversation } from "@11labs/react";
import { useEffect } from "react";
import { useLocal } from "../hooks/use-local";
import { user } from "../user";
import { localzip } from "./localzip";
import { useAI } from "./use-ai";

const questions = [
  "What sets your company apart from others in the same field? Any unique qualifications, proprietary technologies, or differentiators that make your company stand out",
  "Have you worked with government agencies, grant officers or contractors before? If so, can you give an example of a successful project or partnership?",
  "Are there any specific types of contracts or grants that interest you the most (e.g., sole-source, competitive, teaming agreements)?",
  "Do you have any existing security clearances or bonding requirements that may impact your ability to work on government contracts?",
  "What is your organization's mission and primary goal? How do these align with the funding opportunity?",
  "Can you provide a brief overview of your company's services and capabilities?",
  "Have you previously been awarded grants or government contracts? If so, can you give an example of a successful project or partnership?",
  "Do you have any existing certifications (e.g., 8(a), HUBZone, SDVOSB, WOSB) that may be relevant to the funding opportunity?",
];

export const aiOnboardConv = () => {
  const ai = useAI();
  const conv = useConversation();

  const local = useLocal({
    messages: [] as { message: string; source: "user" | "ai"; ts: number }[],
    permission: "pending" as "pending" | "requesting" | "granted" | "denied",
    start: () => {},
    qa_session: {} as Record<string, string>,
    phase: {
      qa: false,
    },
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
      }
    },
  });

  useEffect(() => {
    const start = async () => {
      if (local.permission !== "granted") {
        const timeout = setTimeout(() => {
          local.permission = "requesting";
          local.render();
        }, 1000);

        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          local.permission = "granted";
          local.render();
        } catch (e) {
          console.error("Error requesting microphone access", e);
          local.permission = "denied";
          local.render();
        }
        clearTimeout(timeout);
      }

      if (local.permission === "denied") {
        return;
      }

      const qa_session = localzip.get("gfin-ai-qa-session");
      if (qa_session !== null) {
        for (const question in qa_session) {
          local.qa_session[question] = qa_session[question];
        }
        console.log("QA session loaded", local.qa_session);
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

      conv
        .startSession({
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
            console.log("Disconnected");
          },
        })
        .then((id) => {
          console.log("Session started", id);
        });
    };

    local.start = start;
    local.render();
    start();
    return () => {};
  }, []);

  return {
    conv,
    messages: local.messages,
    permission: local.permission,
    restart: () => local.start(),
  };
};
