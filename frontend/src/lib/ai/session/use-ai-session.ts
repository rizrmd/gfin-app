import { useConversation } from "@11labs/react";
import type { useAI } from "../use-ai";
import { useEffect } from "react";

export const useAISession = (ai: ReturnType<typeof useAI>) => {
  const conv = useConversation({
    agentId: "agent_01jwd0qk9df0qv578y1sd1r874",
    micMuted: true,

    overrides: {
      agent: {
        firstMessage: "Hello world!",
        prompt: {
          prompt: `\
You are a friend.
Call action tool with name and params: 
    - point_finger: ${JSON.stringify({
      finger: {
        type: "number",
        desc: "a number of finger that pointing towards target",
      },
    })}
    - walk: ${JSON.stringify({
      step: {
        type: "number",
        desc: "how many steps to walk",
      },
      direction: {
        type: "string",
        desc: "the direction to walk, can be 'left', 'right', 'forward', or 'backward'",
        enum: ["left", "right", "forward", "backward"],
        example: "forward",
      },
    })}
`,
        },
      },
    },
    clientTools: {
      action: (arg: { param: { finger: number }; name: "point_finger" }) => {
        console.log("params", arg);
      },
    },
    onConnect(props) {
      console.log("Connected to conversation:", props);
    },
  });
  useEffect(() => {
    conv.startSession();
  }, []);

  return { conv };
};
