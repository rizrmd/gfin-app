import { AIForm } from "@/components/custom/ai/form/ai-form";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import { AISession } from "@/components/custom/ai/session/ai-session";
import { formTool } from "@/lib/ai/session/form-tool";
import { useAISession } from "@/lib/ai/session/use-ai-session";
import { useLocal } from "@/lib/hooks/use-local";
import type { Conversation } from "@elevenlabs/client";
import type { FC } from "react";
import { blankOrg } from "shared/lib/client_state";
import { snapshot, subscribe, useSnapshot } from "valtio";

export const questions = [
  "What sets your company apart from others in the same field? Any unique qualifications, proprietary technologies, or differentiators that make your company stand out",
  "Have you worked with government agencies, grant officers or contractors before? If so, can you give an example of a successful project or partnership?",
  "Are there any specific types of contracts or grants that interest you the most (e.g., sole-source, competitive, teaming agreements)?",
  "Do you have any existing security clearances or bonding requirements that may impact your ability to work on government contracts?",
  "What is your organization's mission and primary goal? How do these align with the funding opportunity?",
  "Can you provide a brief overview of your company's services and capabilities?",
  "Have you previously been awarded grants or government contracts? If so, can you give an example of a successful project or partnership?",
  "Do you have any existing certifications (e.g., HUBZone, SDVOSB, WOSB) that may be relevant to the funding opportunity?",
];

const form = localStorage.getItem("form-layout");
const layout = JSON.parse(form!) as AIFormLayout[];

export default () => {
  const local = useLocal({
    formName: "",
    write: null as any,
    getConversation: (() => {}) as () => Conversation | void,
    contextUpdateTimeout: null as null | Timer,
  });
  const session = useAISession({
    name: "Onboarding",
    textOnly: true,
    phases: [
      {
        name: "Onboarding",
        desc: "Answer questions about the organization.",
        async init() {
          return {
            prompt: `\
You are an AI assistant helping to onboard a new organization or company. `,
            firstMessage: {
              assistant:
                "Hello. welcome to the onboarding process. are you ready to provide some information about your organization?",
              user: "start only with question about unfilled data, do not tell me you understand.",
            },
            firstAction: {
              name: "organization_form.activate",
              // name: "question_answer_form.activate",
            },
          };
        },
        tools: [
          // formTool({
          //   name: "question_answer_form",
          //   activate:
          //     "at the beginning of conversation or when it is not activated, or when user said yes, ready, or any affirmative response. ",
          //   layout: [
          //     {
          //       type: "section" as const,
          //       title: "Organization Questions",
          //       isArray: true,
          //       childs: questions.map((question, index) => ({
          //         type: "text-input" as const,
          //         field: question,
          //         title: question,
          //         required: true,
          //       })),
          //     },
          //   ],
          // }),
          formTool({
            name: "organization_form",
            activate: "after question_answer_form submitted",
            blankData: { ...blankOrg },
            init: ({ proxy, getConversation, name }) => {
              local.write = proxy;
              local.formName = name;
              local.getConversation = getConversation;
            },
            layout,
            // layout: [
            //   {
            //     type: "text-input" as const,
            //     field: "name",
            //     title: "Organization Name",
            //     required: true,
            //   },
            //   {
            //     type: "text-area" as const,
            //     field: "description",
            //     title: "Organization Description",
            //     required: false,
            //   },
            //   {
            //     type: "text-input" as const,
            //     field: "website",
            //     title: "Organization Website",
            //     required: false,
            //   },
            // ],
          }),
        ],
      },
    ],
  });

  return (
    <div className="p-10 w-full h-screen flex flex-1">
      <AISession session={session}>
        <div className="flex flex-1 relative overflow-auto">
          <div className="absolute inset-0">
            {local.write && (
              <AIForm
                layout={layout}
                value={snapshot(local.write)}
                onInit={(read, write) => {
                  subscribe(write, () => {
                    const data = snapshot(write);
                    for (const key in data) {
                      local.write[key] = data[key];
                    }

                    const conv = local.getConversation();

                    if (conv) {
                      conv.sendUserActivity();
                      clearTimeout(local.contextUpdateTimeout!);
                      local.contextUpdateTimeout = setTimeout(() => {
                        conv.sendContextualUpdate(
                          `current ${local.formName} data is: ${JSON.stringify(
                            data
                          )}`
                        );
                      }, 1000);
                    }
                  });
                }}
              />
            )}
          </div>
        </div>
        {local.write && <Pre write={local.write} />}
      </AISession>
    </div>
  );
};

const Pre: FC<{ write: any }> = ({ write }) => {
  const read = useSnapshot(write, { sync: true });
  return (
    <div className="flex flex-1 relative">{JSON.stringify(read, null, 2)}</div>
  );
};
