import { AIForm } from "@/components/custom/ai/form/ai-form";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import { useLocal } from "@/lib/hooks/use-local";

export default () => {
  const local = useLocal(
    {
      data: {
        users: [
          { name: "John", email: "john@example.com" },
          { name: "Jane", email: "jane@example.com" }
        ]
      },
    },
    async () => {
      local.render();
    }
  );

  const layout: AIFormLayout[] = [
    {
      type: "section",
      title: "Users",
      isArray: true,
      childs: [
        {
          type: "text-input",
          title: "Name",
          field: "users.name"
        },
        {
          type: "text-input", 
          title: "Email",
          field: "users.email"
        }
      ]
    }
  ];

  return (
    <div className="flex p-10">
      <div className="flex-1">
        <AIForm
          layout={layout}
          value={local.data}
          onChange={(data) => {
            local.data = data;
            local.render();
          }}
        />
      </div>
      <div className="flex flex-1 relative overflow-auto">
        <pre className="font-mono text-xs absolute inset-0">
          {JSON.stringify(local.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
