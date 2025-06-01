import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import { waitUntil } from "@/lib/wait-until";
import type { Conversation } from "@elevenlabs/client";
import { useEffect, useRef, useState } from "react";
import { proxy } from "valtio";
import {
  blankState,
  startConversation,
  type ConversationState,
} from "./start-conversation";

export type AISession = {
  id: string;
  phases: AIPhase[];
};

export type AIPhaseMessage =
  | {
      role: "user" | "assistant";
      content: string;
      timestamp: number;
    }
  | { role: "action"; name: string };

export type AIPhaseToolArg = { textOnly: boolean };

export type AIPhase = {
  name: string;
  desc: string;
  init: () => Promise<{
    prompt: string;
    firstMessage?: { user?: string; assistant?: string };
    firstAction?: { name: string; params?: Record<string, any> };
  }>;
  tools?: ((arg: AIPhaseToolArg) => AIClientTool)[];
  messages?: AIPhaseMessage[];
  onMessage?: (arg: { message: string }) => Promise<void>;
};

export type AIAction = {
  desc?: string;
  intent?: string;
  action: (arg?: any) => void;
  params?: Record<string, any>;
};

export type AIClientTool = {
  name: string;
  prompt: string;
  activate: string;
  actions: Record<string, AIAction>;
};

const w = window as unknown as Window & {
  ai_sessions?: Record<string, AISession>;
};
if (!w.ai_sessions) {
  w.ai_sessions = {};
}

export const useAISession = ({
  name,
  phases,
  currentPhase = 0,
  textOnly,
}: {
  name: string | (() => Promise<string>);
  phases: AISession["phases"];
  currentPhase?: number;
  textOnly?: boolean;
}) => {
  const ref = useRef({ state: proxy({ ...blankState }) } as {
    conv?: Conversation;
    state: ConversationState;
    prompt: string;
    firstMessage: Awaited<ReturnType<AIPhase["init"]>>["firstMessage"];
    firstAction?: { name: string; params?: Record<string, any> };
    currentPhase: number;
    phase: AIPhase;
    actionHistory: { name: string; params?: Record<string, any> }[];
  });
  const [, render] = useState({});

  const initConv = async ({
    textOnly,
    firstMessage,
  }: {
    textOnly: boolean;
    firstMessage?: string;
  }) => {
    const current = ref.current.conv!;
    if (current) {
      await current.endSession();
    }

    ref.current.conv = undefined;

    const tools =
      ref.current.phase.tools?.map((tool) => tool({ textOnly: !!textOnly })) ||
      [];

    if (!ref.current.actionHistory) {
      ref.current.actionHistory = [];
    }

    const { conv, state } = await startConversation({
      prompt: ref.current.prompt,
      textOnly: !!textOnly,
      firstMessage: ref.current.firstMessage,
      tools,
      actionHistory: ref.current.actionHistory!,
      firstAction: ref.current.firstAction,
    });

    state.phase = currentPhase;

    ref.current.conv = conv;
    ref.current.state = state;
    render({});
  };

  useEffect(() => {
    (async () => {
      let sessionName: string;

      if (typeof name === "function") {
        sessionName = await name();
      } else {
        sessionName = name;
      }
      const ses = await api.ai_session({
        action: "create",
        data: {
          id_org: user.organization.id!,
          name: sessionName,
          config: {
            currentPhase: 0,
          },
          state: {
            textOnly: !!textOnly,
            phaseData: {},
          },
        },
      });

      const phase = { ...phases[currentPhase] };

      const { prompt, firstMessage, firstAction } = await phase.init();
      ref.current.prompt = prompt;
      ref.current.firstMessage = firstMessage;
      ref.current.firstAction = firstAction;
      ref.current.currentPhase = currentPhase;
      ref.current.phase = phase;
      initConv({ textOnly: !!textOnly });
    })();
  }, []);

  const state = ref.current.state!;
  return {
    conv: ref.current.conv!,
    talk: {
      on: async () => {
        if (!state.textOnly) {
          state.textOnly = true;

          if (!ref.current.conv) {
            await waitUntil(() => !!ref.current.conv);
          }
          initConv({ textOnly: true, firstMessage: "" });
        }
      },
      off: async () => {
        if (state.textOnly) {
          state.textOnly = false;
          if (!ref.current.conv) {
            await waitUntil(() => !!ref.current.conv);
          }
          initConv({ textOnly: false, firstMessage: "" });
        }
      },
      toggle: async () => {
        state.textOnly = !state.textOnly;

        if (!ref.current.conv) {
          await waitUntil(() => !!ref.current.conv);
        }
        initConv({ textOnly: state.textOnly, firstMessage: "" });
      },
    },
    state: state as ConversationState,
  };
};
