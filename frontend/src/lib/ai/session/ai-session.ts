import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import { Conversation } from "@elevenlabs/client";
import { useEffect, useRef, useState } from "react";
import { proxy } from "valtio";
import {
  blankState,
  startConversation,
  type ConversationState,
} from "./ai-converse";
import { waitUntil } from "@/lib/wait-until";

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

export type AIPhase = {
  name: string;
  desc: string;
  init: () => Promise<{ prompt: string; firstMessage: string }>;
  tools?: AIClientTool[];
  messages?: AIPhaseMessage[];
  onMessage?: (arg: { message: string }) => Promise<void>;
};

export type AIClientTool<T extends Zod.Schema = Zod.Schema> = {
  name: string;
  args: T;
  desc: string;
  action: (opt: {
    args: Zod.infer<T>;
    subAction: (opt: Record<string, (arg: object) => void>) => void;
    conv: Conversation;
    done: (result?: any) => void;
  }) => void;
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
    firstMessage: string;
    currentPhase: number;
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

    const { conv, state } = await startConversation({
      prompt: ref.current.prompt,
      textOnly: !!textOnly,
      firstMessage:
        typeof firstMessage === "string"
          ? firstMessage
          : ref.current.firstMessage,
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

      const { prompt, firstMessage } = await phase.init();
      ref.current.prompt = prompt;
      ref.current.firstMessage = firstMessage;
      ref.current.currentPhase = currentPhase;
      initConv({ textOnly: !!textOnly });
    })();
  }, []);

  const state = ref.current.state!;
  return {
    talk: {
      on: async () => {
        if (!state.textOnly) {
          if (!ref.current.conv) {
            await waitUntil(() => !!ref.current.conv);
          }
          initConv({ textOnly: true, firstMessage: "" });
        }
      },
      off: async () => {
        if (state.textOnly) {
          if (!ref.current.conv) {
            await waitUntil(() => !!ref.current.conv);
          }
          initConv({ textOnly: false, firstMessage: "" });
        }
      },
      toggle: async () => {
        if (!ref.current.conv) {
          await waitUntil(() => !!ref.current.conv);
        }
        initConv({ textOnly: !state.textOnly, firstMessage: "" });
      },
    },
    state: state as ConversationState,
  };
};
