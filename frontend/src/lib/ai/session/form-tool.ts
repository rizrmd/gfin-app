import { convertAIFormToZod } from "@/components/custom/ai/form/ai-form-zod";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import type { AIClientTool, AIPhaseToolArg } from "./use-ai-session";
import { generateSampleData } from "@/components/custom/ai/form/ai-form-sample-data";
import { proxy, snapshot } from "valtio";
import { merge } from "lodash";

export const formTool = ({
  name,
  activate: activate,
  layout,
  init,
}: {
  name: string;
  activate: string;
  layout: AIFormLayout[] | (() => AIFormLayout[] | Promise<AIFormLayout[]>);
  init?: (arg: { updateData: (data: object) => void }) => void;
}) => {
  const current = { data: proxy({}) };
  const updateData = (data: object) => {
    merge(current.data, data);
  };

  if (init) {
    init({ updateData });
  }
  return async ({ textOnly }: AIPhaseToolArg) => {
    const sampleData = JSON.stringify(
      generateSampleData(typeof layout === "function" ? await layout() : layout)
    );

    return {
      name,
      activate,
      prompt: `
whenever you receive an answer from the user, call tool "action" with this arguments:
- name: "${name}.update"
- param: ${sampleData}. 
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
