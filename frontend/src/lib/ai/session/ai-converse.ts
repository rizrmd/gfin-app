import {
  Conversation,
  type Mode,
  type Role,
  type Status,
} from "@elevenlabs/client";
import { proxy } from "valtio";

export const blankState = {
  phase: 0,
  status: "" as Status,
  mode: "" as Mode,
  canSendFeedback: false,
  textOnly: false,
  messages: [] as {
    role: Role;
    content: string;
    timestamp: number;
  }[],
  activeTool: null as null | {
    name: string;
    args: Record<string, any>;
  },
};
export type ConversationState = typeof blankState;
export const startConversation = async (arg: {
  prompt: string;
  textOnly: boolean;
  firstMessage: string;
}) => {
  console.log(arg);
  const state = proxy({ ...blankState, textOnly: arg.textOnly });
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
    textOnly: arg.textOnly,
    onMessage(props) {
      state.messages.push({
        role: props.source,
        content: props.message,
        timestamp: Date.now(),
      });
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
