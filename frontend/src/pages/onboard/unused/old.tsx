import { ConversationQA } from "@/components/custom/ai/onboard/conversation-qa";
import { PickMode } from "@/components/custom/ai/onboard/pick-mode";
import SummaryProfile from "@/components/custom/ai/onboard/summary-profile";
import { SummaryQA } from "@/components/custom/ai/onboard/summary-qa";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { useAiOnboard } from "@/lib/ai/onboard";
import { Protected } from "@/lib/user";

export default () => {
  const ai = useAiOnboard();

  return (
    <Protected>
      <BodyFrame className="flex flex-col items-center justify-center gap-4">
        {ai.local.mode === "" ? (
          <>
            <PickMode ai={ai} len={ai.local.messages.length} />
          </>
        ) : (
          <>
            {ai.local.mode === "auto" && (
              <>
                {ai.local.summary ? (
                  <SummaryQA ai={ai} len={ai.local.messages.length} />
                ) : (
                  <ConversationQA ai={ai} />
                )}
              </>
            )}

            {ai.local.mode === "manual" && (
              <>
                {!ai.local.phase.qa ? (
                  <SummaryQA ai={ai} len={ai.local.messages.length} />
                ) : (
                  <SummaryProfile />
                )}
              </>
            )}
          </>
        )}
      </BodyFrame>
    </Protected>
  );
};
