import { AIForm } from "@/components/custom/ai/form/ai-form";
import type { AIFormLayout } from "@/components/custom/ai/form/ai-form.types";
import { AISession } from "@/components/custom/ai/session/ai-session";
import { Button } from "@/components/ui/button";
import { formTool } from "@/lib/ai/session/form-tool";
import { useAISession } from "@/lib/ai/session/use-ai-session";
import { useLocal } from "@/lib/hooks/use-local";
import type { Conversation } from "@elevenlabs/client";
import type { FC } from "react";
import { snapshot, subscribe } from "valtio";

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

const questionAnswerValue = questions.map((e) => ({
  question: e,
  answer: "",
})) as { answer: string; question: string }[];

export default () => {
  const local = useLocal({
    formName: "",
    write: null as any,
    getConversation: (() => {}) as () => Conversation | void,
    layout: null as null | AIFormLayout[],
    init: ({ proxy, getConversation, name, layout }) => {
      local.write = proxy;
      local.formName = name;
      local.getConversation = getConversation;
      local.layout = layout;
    },
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
              // name: "organization_form.activate",
              name: "question_answer_form.activate",
            },
          };
        },
        tools: [
          formTool({
            name: "question_answer_form",
            activate:
              "at the beginning of conversation or when it is not activated, or when user said yes, ready, or any affirmative response, ensure each answer in the question array is answered. ",
            blankData: questionAnswerValue,
            layout: [
              {
                type: "section" as const,
                title: "Organization Questions",
                isArray: true,
                labelField: "question",
                canAdd: false,
                canMove: false,
                canRemove: false,
                childs: [
                  {
                    type: "text-area" as const,
                    field: "answer",
                    title: "",
                    width: "full",
                  },
                ],
              },
            ],
            init: local.init,
            executeUpdate({ newData, proxy }) {
              console.log("executeUpdate", newData, proxy);
              for (const qa of newData) {
                if (qa.question && qa.answer) {
                  const cur = proxy.find((q) => q.question === qa.question);
                  console.log(qa, cur);
                  if (cur) {
                    cur.answer = qa.answer;
                  }
                }
              }
            },
          }),
          // formTool({
          //   name: "organization_form",
          //   activate: "after question_answer_form submitted",
          //   blankData: { ...blankOrg },
          //   init: local.init,
          //   layout,
          // }),
        ],
      },
    ],
  });

  return (
    <div className="p-10 w-full h-screen flex flex-1">
      <AISession session={session}>
        <div className="flex flex-1 relative overflow-auto">
          <div className="absolute inset-0">
            {local.write && local.layout && (
              <SessionForm
                layout={local.layout}
                write={local.write}
                getConversation={local.getConversation}
                formName={local.formName}
              />
            )}
          </div>
        </div>
        {/* {local.write && <Pre write={local.write} />} */}
      </AISession>
    </div>
  );
};

// const Pre: FC<{ write: any }> = ({ write }) => {
//   const read = useSnapshot(write, { sync: true });
//   return (
//     <div className="flex flex-1 relative">{JSON.stringify(read, null, 2)}</div>
//   );
// };

const SessionForm: FC<{
  layout: AIFormLayout[];
  write: any;
  getConversation: () => Conversation | void;
  formName: string;
}> = ({ write, getConversation, layout, formName }) => {
  const local = useLocal(
    {
      contextUpdateTimeout: null as null | Timer,
      formWrite: null as any,
      updateFromAI: false,
      updateFromUser: false,
    },
    () => {
      subscribe(write, () => {
        const data = snapshot(write);
        console.log(data);
        if (local.updateFromUser) return;
        local.updateFromAI = true;
        for (const key in data) {
          local.formWrite[key] = data[key];
        }
        setTimeout(() => {
          local.updateFromAI = false;
        }, 500);
      });
    }
  );
  return (
    <>
      <AIForm
        layout={layout}
        value={snapshot(write)}
        onInit={(read, formWrite) => {
          local.formWrite = formWrite;
          // subscribe(formWrite, () => {
          //   if (local.updateFromAI) return;
          //   local.updateFromUser = true;
          //   const data = snapshot(formWrite);
          //   for (const key in data) {
          //     write[key] = data[key];
          //   }

          //   const conv = getConversation();

          //   if (conv) {
          //     conv.sendUserActivity();
          //     clearTimeout(local.contextUpdateTimeout!);
          //     local.contextUpdateTimeout = setTimeout(() => {
          //       conv.sendContextualUpdate(
          //         `current ${formName} data is: ${JSON.stringify(data)}`
          //       );
          //       local.updateFromUser = false;
          //     }, 1000);
          //   }
          // });
        }}
      />
    </>
  );
};
