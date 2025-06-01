import { convertAIFormToZod } from "@/components/custom/ai/form/ai-form-zod";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import type { AIClientTool } from "./ai-session";

export const phaseForm = <T extends object>({
  name,
  desc,
  layout,
  data,
}: {
  name: string;
  desc: string;
  layout: AIFormLayout[];
  data: () => Promise<T>;
}): AIClientTool => {
  return {
    name,
    desc,
    args: convertAIFormToZod(layout),
    action: async ({ args, subAction, done }) => {
      const formData = await data();
      const form = { ...formData, ...args };
      subAction({
        update_data: async (update: Partial<T>) => {
          Object.assign(form, update);
        },
        submit_form: async () => {
          done(form);
        },
      });
      return {};
    },
  };
};
