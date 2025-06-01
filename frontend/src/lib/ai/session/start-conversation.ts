import {
  Conversation,
  type Mode,
  type Role,
  type Status,
} from "@elevenlabs/client";
import { proxy } from "valtio";
import type { AIClientTool } from "./use-ai-session";

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
  tools: AIClientTool[];
}) => {
  const state = proxy({ ...blankState, textOnly: arg.textOnly });

  const prompt = `${arg.prompt}\n\n
You should call tool with name "action". 
the action tool takes an object with the following properties:
  - name: the name of the action to call
  - param: an object with the arguments for the action

These are actions available to be passed into the action tool:
${arg.tools
  .map((tool) => {
    let toolName = tool.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    return Object.entries(tool.actions)
      .map(([actionName, { desc, params }]) => {
        return JSON.stringify({
          name: `${toolName}.${actionName}`,
          description: desc,
          param: params,
        });
      })
      .join("\n");
  })
  .join("\n\n")}
  `;

  const actions = {} as Record<string, (params: any) => void>;

  arg.tools.forEach((tool) => {
    const toolName = tool.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    Object.entries(tool.actions).forEach(([actionName, action]) => {
      actions[`${toolName}.${actionName}`] = (params) => {
        if (action.action) {
          action.action(params);
        }
      };
    });
  });

  const conv = await Conversation.startSession({
    agentId: "agent_01jwd0qk9df0qv578y1sd1r874",
    overrides: {
      agent: {
        firstMessage: arg.firstMessage,
        prompt: {
          prompt: prompt,
        },
      },
    },
    textOnly: arg.textOnly,
    clientTools: {
      action: async (params: { name: string; params?: any }) => {
        actions[params.name]?.(params.params);
      },
    },
    onMessage(props) {
      console.log(props);
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
