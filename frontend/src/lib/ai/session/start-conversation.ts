import { waitUntil } from "@/lib/wait-until";
import {
  Conversation,
  type Mode,
  type Role,
  type Status,
} from "@elevenlabs/client";
import { trim } from "lodash";
import { proxy } from "valtio";
import type { AIClientTool, AIPhase } from "./use-ai-session";

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
  firstMessage: Awaited<ReturnType<AIPhase["init"]>>["firstMessage"];
  tools: AIClientTool[];
  actionHistory: { name: string; params?: Record<string, any> }[];
  firstAction?: { name: string; params?: Record<string, any> };
}) => {
  const state = proxy({ ...blankState, textOnly: arg.textOnly });

  let tool_prompt = "";

  if (arg.firstAction) {
    const activeTool = arg.tools.find((e) => e.name === arg.firstAction!.name);
    if (activeTool) {
      tool_prompt = activeTool.prompt;
    }
  }

  if (!tool_prompt) {
    tool_prompt = `

currently there is no action tool activated, you can activate one of the following tools by calling them with their name and parameters:

${arg.tools
  .map((action) => {
    return `\
${trim(action.activate, ",. ")}, call action tool with this arguments:
  - name: "${action.name}.activate"
  
only do these prompt after ${action.name} activated:

---START: ${action.name}---
${action.prompt}
---END: ${action.name}---


do not ask the user if they need anything else.

  `;
  })
  .join("\n\n")}
`;
  }

  const prompt = `\
${arg.prompt}
${tool_prompt}`.trim();

  console.log("prompt:", prompt);

  const actions = {} as Record<
    string,
    { intent?: string | (() => string); action: (params?: any) => void }
  >;

  arg.tools.forEach((tool) => {
    const toolName = tool.name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    Object.entries(tool.actions).forEach(([actionName, action]) => {
      actions[`${toolName}.${actionName}`] = {
        intent: action.intent,
        action: (params) => {
          if (action.action) {
            action.action(params);
          }
        },
      };
    });
  });

  const executeAction = async (name: string, params?: any) => {
    if (!conv.isOpen()) {
      await waitUntil(() => conv.isOpen());
    }

    const definition = actions[name];
    if (definition) {
      if (definition.intent) {
        conv.sendContextualUpdate(
          typeof definition.intent === "function"
            ? definition.intent()
            : definition.intent
        );
      }
      definition.action(params);
      arg.actionHistory.push({
        name: name,
        params: params,
      });
      state.activeTool = {
        name: name,
        args: params || {},
      };
    }
  };

  const conv = await Conversation.startSession({
    agentId: "agent_01jwr4n4qnfax9dp0t2gz235gt",
    overrides: {
      agent: {
        firstMessage: arg.firstMessage?.assistant,
        prompt: {
          prompt: prompt,
        },
      },
    },
    textOnly: arg.textOnly,
    clientTools: {
      action: async (action: { name: string; param?: any }) => {
        executeAction(action.name, action.param);
      },
    },
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
    onDisconnect: () => {
      console.log("Conversation disconnected");
      state.status = "disconnected";
    },
    onError(message, context) {
      console.error("Conversation error:", message, context);
    },
  });

  const action = arg.firstAction;
  if (action && arg.actionHistory.length === 0) {
    await executeAction(action.name, action.params);
  }

  if (arg.firstMessage?.user) {
    conv.sendUserMessage(arg.firstMessage.user);
  }

  return { conv, state };
};
