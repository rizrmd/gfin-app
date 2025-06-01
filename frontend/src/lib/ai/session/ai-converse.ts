import { Conversation, type Mode, type Status } from "@elevenlabs/client";
import { proxy } from "valtio";

export const startConversation = async (arg: {
  prompt: string;
  textOnly: boolean;
  firstMessage: string;
}) => {
  const state = proxy({
    status: "" as Status,
    mode: "" as Mode,
    canSendFeedback: false,
  });
  const conv = await Conversation.startSession({
    agentId: "agent_01jwd0qk9df0qv578y1sd1r874",
    overrides: {
      agent: {
        firstMessage: arg.firstMessage,
        prompt: {
          prompt: arg.prompt,
        },
      },
      conversation: {
        textOnly: arg.textOnly,
      },
    },
    onModeChange: ({ mode }) => {
      state.mode = mode;
    },
    onStatusChange: ({ status }) => {
      state.status = status;
    },
    onCanSendFeedbackChange({ canSendFeedback }) {
      state.canSendFeedback = canSendFeedback;
    },
  });
  return { conv, state };
};
