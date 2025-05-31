// Example usage of AIForm component
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocal } from "@/lib/hooks/use-local";
import { AIForm } from "./ai-form";
import type { AIFormLayout } from "./ai-form.types";

export const AIFormExample = () => {
  const local = useLocal({
    formData: {
      name: "",
      description: "",
      categories: [],
      status: "",
      preferences: {
        notifications: false,
        newsletter: false,
      },
    },
    showResult: false,
  });

  // Example form layout configuration
  const formLayout: AIFormLayout = {
    type: "section",
    title: "Project Information",
    childs: [
      {
        type: "text",
        field: "name",
        title: "Project Name",
        required: true,
        suggestions: ["AI Research", "Data Analysis", "Web Development"],
      },
      {
        type: "multi-text",
        field: "description",
        title: "Project Description",
        required: true,
        suggestions: [
          "Describe your project goals...",
          "What problem does this solve?",
        ],
      },
      {
        type: "checkbox",
        field: "categories",
        title: "Project Categories",
        mode: "array-string",
        layout: "vertical",
        options: [
          { label: "Artificial Intelligence", value: "ai" },
          { label: "Machine Learning", value: "ml" },
          { label: "Data Science", value: "data-science" },
          { label: "Web Development", value: "web-dev" },
        ],
      },
      {
        type: "dropdown",
        field: "status",
        title: "Project Status",
        required: true,
        options: [
          { label: "Planning", value: "planning" },
          { label: "In Progress", value: "in-progress" },
          { label: "Completed", value: "completed" },
          { label: "On Hold", value: "on-hold" },
        ],
      },
      {
        type: "checkbox",
        field: "preferences.notifications",
        title: "Email Notifications",
        mode: "object-boolean",
        layout: "horizontal",
        options: [
          { label: "Enable notifications", value: "notifications" },
        ],
      },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">AIForm Example</h2>
        
        {!local.showResult ? (
          <AIForm
            layout={formLayout}
            value={local.formData}
            onSubmit={async (data) => {
              console.log("Form submitted:", data);
              local.formData = data;
              local.showResult = true;
              local.render();
            }}
            className="space-y-6"
          />
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Form Submission Result:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(local.formData, null, 2)}
            </pre>
            <Button
              onClick={() => {
                local.showResult = false;
                local.render();
              }}
              variant="outline"
            >
              Edit Form
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
