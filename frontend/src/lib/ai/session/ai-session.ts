import { api } from "@/lib/gen/api";
import { user } from "@/lib/user";
import { Conversation, type Mode, type Status } from "@elevenlabs/client";
import { proxy, ref } from "valtio";
import { startConversation } from "./ai-converse";

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

export const aiSession = {
  start: async ({
    name,
    phases,
    currentPhase = 0,
    textOnly,
  }: {
    name: string;
    phases: AISession["phases"];
    currentPhase?: number;
    textOnly?: boolean;
  }) => {
    if (user.organization.id === "") {
      throw new Error("Organization ID is required to create an AI session.");
    }

    const ses = await api.ai_session({
      action: "create",
      data: {
        id_org: user.organization.id!,
        name,
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

    const { conv, state } = await startConversation({
      prompt,
      textOnly: !!textOnly,
      firstMessage,
    });

    return {
      conv,
      state,
    };
  },
};
