import { Button } from "@/components/ui/button";
import type { useAISession } from "@/lib/ai/session/use-ai-session";
import type { FC, ReactNode } from "react";
import { useSnapshot } from "valtio";

export const AISession: FC<{
  session: ReturnType<typeof useAISession>;
  children?: ReactNode;
}> = ({ session, children }) => {
  const { conv, state } = session;
  const read = useSnapshot(session.state);
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex">
        {" "}
        {state.status === "connected" && (
          <> {state.textOnly ? "Text" : "Voice"}</>
        )}
        <Button
          onClick={() => {
            if (conv) conv.sendUserMessage("Yes");
          }}
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            if (conv) conv.sendUserMessage("No");
          }}
        >
          No
        </Button>
        <Button
          onClick={() => {
            if (conv)
              conv.sendUserMessage(
                "my company name is Deep Learning Intelligence"
              );
          }}
        >
          Name
        </Button>
        <Button
          onClick={() => {
            if (conv)
              conv.sendUserMessage(
                "A Technology company focused on AI based solutions"
              );
          }}
        >
          Description
        </Button>
        <Button
          onClick={() => {
            if (conv) conv.sendUserMessage("deeplearningintelligence.com");
          }}
        >
          Web
        </Button>
        <Button
          onClick={() => {
            if (conv)
              conv.sendUserMessage(
                "my company name is Deep learning intelligence, it is a technology company focused on AI based solutions. The url is deeplearningintellice.com."
              );
          }}
        >
          Combined
        </Button>
        <Button
          onClick={() => {
            if (conv)
              conv.sendUserMessage("wait, my company is Damu Intelligence.");
          }}
        >
          Revise
        </Button>
        <br />
        <Button
          onClick={() => {
            if (conv)
              conv.sendUserMessage(
                "We built bespke AI solution for businesses."
              );
          }}
        >
          Q1
        </Button>
        <Button
          onClick={() => {
            if (conv)
              conv.sendUserMessage(
                "We built bespke AI solution for businesses."
              );
          }}
        >
          Q1
        </Button>
        <Button
          onClick={() => {
            if (conv) conv.sendUserMessage("What is current data.");
          }}
        >
          Q1
        </Button>
      </div>
      <div className="flex flex-1 justify-between">
        <div className="flex-1 flex-col flex">
          {read.messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <strong>{msg.role}:</strong> {msg.content}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col relative">{children}</div>
      </div>
    </div>
  );
};
