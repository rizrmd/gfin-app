import { AISession } from "@/components/custom/ai/session/ai-session";
import { formTool } from "@/lib/ai/session/form-tool";
import { useAISession } from "@/lib/ai/session/use-ai-session";

export default () => {
  const layout = [
    {
      type: "text-input" as const,
      field: "name",
      title: "Organization Name",
      required: true,
    },
    {
      type: "text-area" as const,
      field: "description",
      title: "Organization Description",
      required: false,
    },
    {
      type: "text-input" as const,
      field: "website",
      title: "Organization Website",
      required: false,
    },
  ];

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
You are an AI assistant helping to onboard a new organization or company.`,
            firstMessage: {
              assistant:
                "Hello. welcome to the onboarding process. are you ready to provide some information about your organization?",
              // user: "call action tool with name organization_form.activate",
              user: 'yes, ask me my organization name.'
            },
            firstAction: {
              name: "organization_form.activate",
            },
          };
        },
        tools: [
          formTool({
            name: "organization_form",
            activate:
              "at the beginning of conversation or when it is not activated, or when user said yes, ready, or any affirmative response ",
            layout,
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
