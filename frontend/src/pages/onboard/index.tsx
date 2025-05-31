import { AIForm } from "@/components/custom/ai/form/ai-form";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import { useAI } from "@/lib/ai/use-ai";
import { useLocal } from "@/lib/hooks/use-local";
import { blankOrg } from "shared/lib/client_state";

export default () => {
  const ai = useAI();
  const local = useLocal(
    {
      form: {
        layout: [] as AIFormLayout[],
        data: null as any,
      },
    },
    async () => {
      const form = localStorage.getItem("form-layout");
      if (form) {
        local.form.layout = JSON.parse(form) as AIFormLayout[];
        console.log(local.form.layout);
        local.form.data = blankOrg;
        local.render();
        return;
      }
      const res = await ai.task.do("groq", {
        prompt: `
Please create an AIFormLayout configuration for this object ${JSON.stringify(
          blankOrg
        )}. 


This is the definition of AIFormLayout:
export type AIFieldText = {
  type: "text-input" | "text-area";
  suggestions?: string[];
  title?: string;
  field: string;
  required?: boolean;
};

export type AIFieldCheckbox = {
  type: "checkbox";
  options: { label: string; value: string }[];
  mode: "object-boolean" | "array-string";
  layout?: "horizontal" | "vertical" | "dropdown";
  title?: string;
  field: string;
  required?: boolean;
};

export type AIFieldDropdown = {
  type: "dropdown";
  options: { label: string; value: string }[];
  title?: string;
  field: string;
  required?: boolean;
};

export type AIFormSection = {
  type: "section";
  title: string;
  childs: AIField[];
  isArray: boolean; 
};

export type AIField =
  | AIFieldText
  | AIFieldCheckbox
  | AIFieldDropdown;
export type AIFormLayout = AIField | AIFormSection;


`,
      });

      if (Array.isArray(res.answer)) {
        local.form.layout = res.answer as unknown as AIFormLayout[];
        localStorage.setItem("form-layout", JSON.stringify(local.form.layout));
        local.form.data = blankOrg;
        local.render();
      }
    }
  );
  // const { conv } = useAISession(ai);

  return (
    <div className="flex p-10">
      <div className="flex-1">
        {local.form.data && (
          <AIForm
            layout={local.form.layout}
            value={local.form.data}
            onChange={(data) => {
              local.form.data = data;
              local.render();
            }}
          />
        )}
      </div>
      <div className="flex flex-1 relative overflow-auto">
        <pre className="font-mono text-xs absolute inset-0">
          {JSON.stringify(local.form.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
