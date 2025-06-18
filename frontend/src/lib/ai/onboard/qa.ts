import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import type { useConversation } from "@elevenlabs/react";
import { localzip } from "../localzip";
import type { useAI } from "../use-ai";
import type { aiOnboardLocal } from "./local";
import { navigate } from "@/lib/router"; // Tambahkan import ini

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
  console.log("Starting Q&A onboarding with questions:", questions);
  let firstMessage = await defineFirstMessage(arg);

  if (
    Object.keys(local.qa_user).length > 0 ||
    local.messages.find((e) => e.source === "user")
  ) {
    await storeQA(arg);
  }

  let systemPrompt =
    Object.keys(local.qa_final).length === questions.length
      ? undefined
      : `You are a helpful assistant for gofunditnow client onboarding. Your role is to:

1. Ask questions one at a time - do not ask multiple questions at once
2. After EACH user response:
   - Analyze if it answers the current question
   - Call the 'answer' tool immediately when you get a valid answer
   - Only move to the next question after storing the current answer
   - If the answer is unclear, politely ask for clarification

The organization is {{org_name}} located in {{state}} - USA.

Questions to ask:
{{questions}}

Current progress:
- Answered questions: ${JSON.stringify(local.qa_final)}
- Questions remaining: ${questions.length - Object.keys(local.qa_final).length}

Important:
- Call 'answer' tool IMMEDIATELY after getting each answer
- Do not skip calling the 'answer' tool
- If user provides relevant information, use it to answer appropriate questions
- Never proceed to next question without storing the current answer

When all questions are answered:
1. Call 'end_call' tool
2. Thank the user
3. Inform them about upcoming Organization profile onboarding`;

  const textQuestions = questions
    .map((e, idx) => `${idx + 1}. ${e.replace(/"/g, "'")}`)
    .join("\n ");

  console.log("Starting conversation with questions:", textQuestions);
  conv.startSession({
    agentId: "agent_01jvcrfcp1ere9ys6m72dejez9",
    dynamicVariables: {
      user_name: user.fullName,
      org_name: user.organization.data!.entityInformation.entityName,
      state: user.organization.data!.filingInformation?.state,
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
        try {
          if (!params.question || !params.answer) {
            console.error("Invalid answer params:", params);
            return;
          }

          console.log("Processing answer:", params);
          
          local.qa_user[params.question] = params.answer;
          localzip.set("gfin-ai-qa-user", local.qa_user);
          
          // Force render setelah update qa_user
          local.render();
          
          await storeQA(arg);
          
          if (Object.keys(local.qa_final).length >= questions.length) {
            local.qa_done = true;
            local.phase.qa = true;
            local.render();
            
            if (user.organization.id) {
              await api.ai_onboard({
                mode: "update",
                id: user.organization.id,
                questions: local.qa_final,
                onboard: local.phase,
              });
            }
          }
        } catch (error) {
          console.error("Error in answer handler:", error);
        }
      },
      pause: () => {
        local.pause();
        conv.endSession();
      },
    },
    onMessage(props) {
      try {
        if (!props.message) {
          console.warn("Empty message received:", props);
          return;
        }

        if (Object.keys(local.qa_final).length >= questions.length) {
          local.qa_done = true;
        }

        // Pastikan message valid sebelum di-push
        const newMessage = { 
          ...props, 
          ts: Date.now(),
          message: props.message.trim() // Pastikan tidak ada whitespace
        };
        
        local.messages.push(newMessage);
        console.log("New message added:", newMessage);
        
        // Force render setelah update messages
        local.render();

        // Simpan ke local storage jika ada user message
        if (local.messages.find((e) => e.source === "user")) {
          localzip.set("gfin-ai-qa-msgs", local.messages);
        }
      } catch (error) {
        console.error("Error in onMessage:", error);
      }
    },
    onError(message, context) {
      console.error("Error in conversation", message, context);
    },
    async onDisconnect() {
      if (local.paused) return;

      if (local.qa_done) {
        local.phase.qa = true; 
        local.render();
        if (user.organization.id) {
          await api.ai_onboard({
            mode: "update", 
            id: user.organization.id,
            onboard: local.phase,
          });
          
          // Redirect setelah AI selesai berbicara
          navigate("/profile");
        }
        return;
      }
      
      await storeQA(arg);
      onboardQA(arg);
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
    const res = await ai.task.do("groq", {
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
  try {
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
    const res = (await ai.task.do("groq", {
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
      if (Object.keys(local.qa_final).length >= questions.length) {
        local.qa_done = true;
        local.render();
      }

      if (Object.keys(local.qa_final).length > 0) {
        // Add await here and error handling
        await api.ai_onboard({
          mode: "update",
          id: user.organization.id,
          questions: local.qa_final,
          onboard: local.phase,
        });
        console.log("Q&A data saved successfully:", local.qa_final);
      }
    } else {
      console.error("No organization ID found");
    }
  } catch (error) {
    console.error("Error storing Q&A data:", error);
    // Optionally add error handling UI feedback here
  }
};
