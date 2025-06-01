import { Button } from "@/components/ui/button";
import type { useAISession } from "@/lib/ai/session/use-ai-session";
import type { FC } from "react";
import { useSnapshot } from "valtio";

export const AISession: FC<{ session: ReturnType<typeof useAISession> }> = ({
  session,
}) => {
  const { conv, state } = session;
  const read = useSnapshot(session.state);
  return (
    <>
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
              "deeplearningintellice.com is a technology company focused on AI based solutions"
            );
        }}
      >
        all
      </Button>
      {read.messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
    </>
  );
};
