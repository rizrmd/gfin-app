import { Button } from "@/components/ui/button";
import { useAISession } from "@/lib/ai/session/ai-session";
import { useAI } from "@/lib/ai/use-ai";
import { blankOrg } from "shared/lib/client_state";
import { useSnapshot } from "valtio";

export default () => {
  const ai = useAI();
  const { talk, state } = useAISession({
    name: "Onboarding",
    textOnly: true,
    phases: [
      {
        name: "Q&A",
        desc: "Answer questions about the organization.",
        async init() {
          return {
            prompt: `You are an AI assistant helping to onboard a new organization.
Your task is to answer questions about the organization based on the provided data.
The organization data is: ${JSON.stringify(blankOrg)}`,
            firstMessage: `Welcome to the onboarding process! Please ask me any questions you have about the organization.`,
          };
        },
      },
    ],
  });
  const read = useSnapshot(state);

  return (
    <div className="p-10">
      <Button
        onClick={() => {
          talk.toggle();
        }}
      >
        Hello {state.textOnly ? "Text" : "Voice"}
      </Button>
      {read.messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
};
