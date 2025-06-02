import { convertAIFormToZod } from "@/components/custom/ai/form/ai-form-zod";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import type { AIClientTool, AIPhaseToolArg } from "./use-ai-session";
import { generateSampleData } from "@/components/custom/ai/form/ai-form-sample-data";
import { proxy, snapshot } from "valtio";
import { cloneDeep, merge } from "lodash";
import { Conversation } from "@elevenlabs/client";

export const formTool = ({
  name,
  activate: activate,
  layout,
  init,
  blankData,
}: {
  name: string;
  activate: string;
  blankData?: Record<string, any>;
  layout: AIFormLayout[] | (() => AIFormLayout[] | Promise<AIFormLayout[]>);
  init?: (arg: {
    proxy: any;
    getConversation: () => void | Conversation;
    layout: AIFormLayout[];
    name: string;
  }) => void;
}) => {
  const current = { data: proxy(blankData ? cloneDeep(blankData) : {}) };
  const updateData = (data: object) => {
    merge(current.data, data);
  };

  return async ({ getConversation }: AIPhaseToolArg) => {
    const finalLayout = typeof layout === "function" ? await layout() : layout;
    const finalSample = blankData
      ? JSON.stringify(blankData)
      : JSON.stringify(generateSampleData(finalLayout));

    if (init) {
      init({ getConversation, proxy: current.data, name, layout: finalLayout });
    }

    return {
      name,
      activate,
      prompt: `
whenever you receive an answer from the user, call tool "action" with this arguments:
- name: "${name}.update"
- param: ${finalSample}. 
You can that action tool multiple times to update the form data. always deduce the param from the user answer, do not ask the user to provide the param in a specific format.

if you are done with the form, call tool "action" with this arguments:
- name: "${name}.submit"
`,
      actions: {
        activate: {
          intent: () => {
            const data = snapshot(current.data);
            return `\
the ${name} is activated, do not activate it again, 
when you get the answer for unfilled field continue with ${name}.update action.
current data is: ${JSON.stringify(data)}.
`;
          },
          action: () => {
            console.log("show form", name);
          },
        },
        update: {
          intent: () => {
            const data = snapshot(current.data);
            return `\
when you get the answer for unfilled field continue with ${name}.update action.
current data is: ${JSON.stringify(data)}.`;
          },
          action: (arg) => {
            updateData(arg);
            console.log("update form", name, arg);
          },
        },
        submit: {
          action: () => {
            const data = snapshot(current.data);
            console.log("submit form", name, data);
          },
        },
      },
    } satisfies AIClientTool;
  };
};
