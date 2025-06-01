import { AISession } from "@/components/custom/ai/session/ai-session";
import { formTool } from "@/lib/ai/session/form-tool";
import { useAISession } from "@/lib/ai/session/use-ai-session";

export default () => {
  const session = useAISession({
    name: "Onboarding",
    textOnly: true,
    phases: [
      {
        name: "Q&A",
        desc: "Answer questions about the organization.",
        async init() {
          return {
            prompt: `\
You are an AI assistant helping to onboard a new organization. use action tool with name "organization_form" at start of the session to collect organization data.`,
            firstMessage: ``,
          };
        },
        tools: [
          formTool({
            name: "organization_form",
            desc: "Provide organization data",
            layout: [
              {
                type: "text-input",
                field: "name",
                title: "Organization Name",
                required: true,
              },
              {
                type: "text-area",
                field: "description",
                title: "Organization Description",
                required: false,
              },
              {
                type: "text-input",
                field: "website",
                title: "Organization Website",
                required: false,
              },
            ],
          }),
        ],
      },
    ],
  });

  return (
    <div className="p-10">
      <AISession session={session} />
    </div>
  );
};
