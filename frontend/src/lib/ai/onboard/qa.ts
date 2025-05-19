import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import type { useConversation } from "@11labs/react";
import { localzip } from "../localzip";
import type { useAI } from "../use-ai";
import type { aiOnboardLocal } from "./local";

export const onboardQA = async (arg: {
  local: ReturnType<typeof aiOnboardLocal>;
  conv: ReturnType<typeof useConversation>;
  ai: ReturnType<typeof useAI>;
  questions: string[];
}) => {
  const { local, conv, ai, questions } = arg;
  const qa_session = localzip.get("gfin-ai-qa-user");
  if (qa_session !== null) {
    for (const question in qa_session) {
      local.qa_user[question] = qa_session[question];
    }
  }

  let firstMessage = await defineFirstMessage(arg);

  if (
    Object.keys(local.qa_user).length > 0 ||
    local.messages.find((e) => e.source === "user")
  ) {
    await storeQA(arg);
  }

  let systemPrompt =
    Object.keys(local.qa_final).length === 0
      ? undefined
      : `You are a helpful assistant to help onboard clients to gofunditnow you will capture the needed questions to help them build quality proposals for grants and government contracts. this information needs to be captured form the users in a conversation/consulting manner this will be used and passed to another agent to  hep identify opportunities and write proposals for them. 

Dont read all the whole question keep them short and sweet use these as a guide 

If the user has profile information use that to have knowledge on the customer and confirm the answer to the question get as much data from them as you can to help us apply for the contracts 

The organization is {{org_name}} located in {{state}} - USA. 

The list of questions are as followed, 

{{questions}}

If all of the questions have been answered, you should call 'end_call' tool , and say thank you to the user also inform them that we will do Organization profile onboarding.

these are the question and answer that already answered by the user do not ask them again: 

${JSON.stringify(
  local.qa_final
)}, you should call 'answer' tool when you have the answer to the question. If all of the questions have been answered, you should call 'end_call' tool, and say thank you to the user also inform them that we will do Organization profile onboarding.

there are ${
          questions.length - Object.keys(local.qa_final).length
        } questions left to ask the user.
`;

  const textQuestions = questions
    .map((e, idx) => `${idx + 1}. ${e.replace(/"/g, "'")}`)
    .join("\n ");

  conv.startSession({
    agentId: "agent_01jvcrfcp1ere9ys6m72dejez9",
    dynamicVariables: {
      user_name: user.fullName,
      org_name: user.organization.data!.entityInformation.entityName,
      state: user.organization.data!.filingInformation.state,
      questions: textQuestions,
    },
    overrides: firstMessage
      ? {
          agent: {
            firstMessage,
            prompt: systemPrompt
              ? {
                  prompt: systemPrompt,
                }
              : undefined,
          },
        }
      : undefined,
    clientTools: {
      answer: async (params) => {
        local.qa_user[params.question] = params.answer;
        localzip.set("gfin-ai-qa-user", local.qa_user);
        local.render();
        await storeQA(arg);
        if (local.qa_done) {
          conv.sendContextualUpdate("All questions have been answered");
        }
      },
    },
    onMessage(props) {
      if (Object.keys(local.qa_final).length === questions.length) {
        local.qa_done = true;
      }
      local.messages.push({ ...props, ts: Date.now() });
      local.render();
      if (local.messages.find((e) => e.source === "user")) {
        localzip.set("gfin-ai-qa-msgs", local.messages);
      }
    },
    onError(message, context) {
      console.error("Error in conversation", message, context);
    },
    async onDisconnect() {
      if (local.qa_done) {
        local.phase.qa = true;
        local.render();
        api.ai_onboard({
          mode: "update",
          id: user.organization.id!,
          onboard: local.phase,
        });
      } else {
        await storeQA(arg);
        onboardQA(arg);
      }
    },
  });
};

const defineFirstMessage = async ({
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
  let firstMessage: undefined | string = undefined;
  const gfin_msgs = localzip.get("gfin-ai-qa-msgs") || [];
  if (gfin_msgs.length >= 2 || Object.keys(local.qa_final).length > 0) {
    const res = await ai.task.do("ask", {
      prompt: `\
These are our last conversation: ${JSON.stringify(gfin_msgs)}. 

${
  Object.keys(local.qa_final).length > 0
    ? `\
These are the questions that we have already asked the user: ${JSON.stringify(
        local.qa_final
      )}

there are ${
        questions.length - Object.keys(local.qa_final).length
      } questions left to ask the user, told the user how many question are left.`
    : ""
}

Do your best to summarize our last conversation in a single sentence, ignore chit-chat or greetings from our last conversation. Greet me (${
        user.fullName
      }) with that summary.
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
  return firstMessage;
};

const storeQA = async ({
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
  const prompt = `Extract high-quality question and answer pairs from the conversation below, improving upon existing low-quality Q&A pairs.

Input:
1. Conversation transcript (JSON format)
2. Predefined list of questions to extract answers for
3. Existing low-quality Q&A pairs that need improvement

Rules:
1. Only include questions from the predefined list
2. Only extract answers that directly respond to those questions
3. If a question has no answer in the conversation, set the answer value to null
4. When improving existing low-quality Q&A pairs:
   - Correct any inaccuracies by referencing the actual conversation
   - Expand incomplete answers with relevant details from the conversation
   - Maintain factual consistency with the conversation
   - Remove any hallucinated or unsupported information
5. Format output as valid JSON object: 
   {
     "question 1": "answer 1",
     "question 2": "answer 2",
   }
7. Only include the question and answer pairs in the output, do not include question without answer.
6. Do not include explanations or thoughts in the output, 

Conversation:
${JSON.stringify(local.messages)}

Predefined questions:
${JSON.stringify(questions)}

Existing low-quality Q&A pairs:
${JSON.stringify(local.qa_user)}

Existing sumarized Q&A pairs:
${JSON.stringify(local.qa_final)}

`;
  const res = (await ai.task.do("ask", {
    prompt,
  })) as unknown as Record<string, string>;

  if (typeof res === "object" && !res.content) {
    for (const q in res) {
      if (
        !!res[q] &&
        res[q] !== "null" &&
        q.length > "Are you ready to start?".length
      ) {
        local.qa_final[q] = res[q];
      }
    }
    local.render();
  } else {
  }

  if (user.organization.id) {
    if (Object.keys(local.qa_final).length === questions.length) {
      local.qa_done = true;
      local.render();
    }

    if (Object.keys(local.qa_final).length > 0) {
      api.ai_onboard({
        mode: "update",
        id: user.organization.id,
        questions: local.qa_final,
        onboard: local.phase,
      });
    }
  }
};
