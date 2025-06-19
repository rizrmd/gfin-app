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

  const systemPrompt = `You are a helpful assistant for gofunditnow client onboarding. Your role is to:

1. Ask questions one at a time from the provided list
2. For EACH user response:
   - Listen carefully to user's answer
   - IMPORTANT: Call the 'answer' tool with exact parameters:
     {
       "question": "<the exact question from list>",
       "answer": "<user's complete answer>"
     }
   - Verify the answer was stored before moving to next question
   - If answer is unclear, ask for clarification

Current Questions Progress:
Questions Answered: {{answered_count}} of {{total_questions}}
Remaining Questions: {{remaining_questions}}

Questions to ask:
{{questions}}

CRITICAL INSTRUCTIONS:
1. ALWAYS call 'answer' tool after EACH valid response and before continuing to the next question
2. Use EXACT question text from the list when calling 'answer'
3. Include complete user response as answer
4. Confirm answer is stored before continuing
5. Never skip the 'answer' tool call
6. Stay focused on getting answers for remaining questions

Example correct behavior:
User: "Our organization's mission is to help homeless pets"
Assistant: Let me save that answer.
[Calls 'answer' tool with exact question and complete response]
"Thank you. Now for the next question..."

When all questions are complete:
1. Verify all questions have answers
2. Thank the user
3. End the conversation`;

  const answered_count = Object.keys(local.qa_final).length;
  const total_questions = questions.length;
  const remaining_questions = questions.filter((q) =>
    !Object.keys(local.qa_final).includes(q)
  );

  const textQuestions = questions
    .map((e, idx) => `${idx + 1}. ${e.replace(/"/g, "'")}`)
    .join("\n ");

  console.log("Starting conversation with questions:", textQuestions);
  conv.startSession({
    agentId: "agent_01jvcrfcp1ere9ys6m72dejez9",
    dynamicVariables: {
      answered_count,
      total_questions,
      remaining_questions: remaining_questions.join("\n"),
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
          console.log("Answer tool called with params:", params);
          console.log("Current qa_user state:", local.qa_user);

          if (!params.question || !params.answer) {
            console.error("Invalid answer params:", params);
            return;
          }

          console.log("Processing answer:", params);

          local.qa_user[params.question] = params.answer;
          console.log("Updated qa_user:", local.qa_user);
          
          localzip.set("gfin-ai-qa-user", local.qa_user);
          console.log("Saved to localzip");

          local.render();
          console.log("Rendered with new state");

          await storeQA(arg);
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
          message: props.message.trim(), // Pastikan tidak ada whitespace
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
    // Memastikan data yang akan di-stringify adalah valid JSON
    const safeMessages = local.messages.map((msg) => ({
      message: String(msg.message || ""),
      source: String(msg.source || ""),
      ts: Number(msg.ts) || Date.now(),
    }));

    const prompt = `Extract high-quality question and answer pairs from the conversation below.

Input Data:
Conversation: ${JSON.stringify(safeMessages)}
Questions: ${JSON.stringify(questions)}
Current Q&A: ${JSON.stringify(local.qa_user)}
Summarized Q&A: ${JSON.stringify(local.qa_final)}

Instructions:
1. Output must be a valid JSON object with question-answer pairs
2. Only include questions from the provided list
3. Answer format: { "question": "answer" }
4. Skip questions without clear answers
5. No additional text or explanations in output

Example valid output:
{
  "What is your mission?": "Our mission is to help others",
  "Where are you located?": "New York City"
}
`;

    const res = await ai.task.do("groq", {
      prompt,
      system:
        "You are a Q&A extraction assistant. Output must be valid JSON object containing only question-answer pairs.",
    });

    // Better response validation
    if (!res || typeof res !== 'object') {
      throw new Error('Invalid response from Groq API');
    }

    // Handle both object and string responses
    let qaData = res;
    if (typeof res === 'string') {
      try {
        qaData = JSON.parse(res);
      } catch (e) {
        console.error('Failed to parse Groq response:', e);
        throw new Error('Invalid JSON response from Groq');
      }
    }

    // Process valid Q&A pairs
    let validPairsCount = 0;
    for (const [question, answer] of Object.entries(qaData)) {
      if (
        questions.includes(question) && 
        typeof answer === 'string' && 
        answer.trim().length > 0
      ) {
        local.qa_final[question] = answer.trim();
        validPairsCount++;
      }
    }

    console.log("Q&A Processing Results:", {
      totalReceived: Object.keys(qaData).length,
      validPairs: validPairsCount,
      currentTotal: Object.keys(local.qa_final).length
    });

    local.render();

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
