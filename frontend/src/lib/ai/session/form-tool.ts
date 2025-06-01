import { convertAIFormToZod } from "@/components/custom/ai/form/ai-form-zod";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import type { AIClientTool, AIPhaseToolArg } from "./use-ai-session";

export const formTool = ({
  name,
  desc,
  layout,
}: {
  name: string;
  desc: string;
  layout: AIFormLayout[];
}) => {
  const zodSchema = convertAIFormToZod(layout);

  return ({ textOnly }: AIPhaseToolArg) =>
    ({
      name,
      desc:
        desc + !textOnly
          ? ". This will collect all fields all at once. "
          : ". Ask each field to the user one by one.",
      actions: {
        show: {
          desc: "show the form",
          action: () => {
            console.log("show form", name);
          },
        },
        update: {
          desc: "update several fields at once",
          action: (arg) => {
            const parsed = zodSchema.safeParse(arg);
            if (!parsed.success) {
              console.error("Invalid form data", parsed.error);
              return;
            }
            console.log("update form", name, parsed.data);
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
