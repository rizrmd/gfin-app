import { convertAIFormToZod } from "@/components/custom/ai/form/ai-form-zod";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import type { AIClientTool, AIPhaseToolArg } from "./use-ai-session";
import { generateSampleData } from "@/components/custom/ai/form/ai-form-sample-data";

export const formTool = ({
  name,
  activate: activate,
  layout,
}: {
  name: string;
  activate: string;
  layout: AIFormLayout[];
}) => {
  const zodSchema = convertAIFormToZod(layout);

  const sampleData = JSON.stringify(generateSampleData(layout));
  return ({ textOnly }: AIPhaseToolArg) =>
    ({
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
          intent: `the ${name} is activated, do not activate it again, continue with ${name}.update action`,
          action: () => {
            console.log("show form", name);
          },
        },
        update: {
          action: (arg) => {
            console.log("update form", name, arg);
          },
        },
        submit: {
          action: () => {
            console.log("submit form", name);
          },
        },
      },
    } satisfies AIClientTool);
};
