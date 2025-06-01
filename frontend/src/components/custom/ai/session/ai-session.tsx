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
      <Button
        onClick={() => {
          if (conv) conv.sendUserMessage("Okay let's get started");
        }}
      >
        Hello {state.textOnly ? "Text" : "Voice"}
      </Button>
      {read.messages.map((msg, index) => (
        <div key={index} className={`message ${msg.role}`}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
    </>
  );
};
