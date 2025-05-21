import { AppLogo } from "@/components/app/logo";
import { HeaderRight } from "@/components/custom/ai/header-right";
import { ConversationQA } from "@/components/custom/ai/onboard/conversation-qa";
import { PickMode } from "@/components/custom/ai/onboard/pick-mode";
import { SummaryQA } from "@/components/custom/ai/onboard/summary-qa";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Badge } from "@/components/ui/badge";
import { aiOnboard } from "@/lib/ai/onboard";
import { Protected, user } from "@/lib/user";

export default () => {
  const ai = aiOnboard();

  return (
    <Protected>
      <BodyFrame
        className="flex flex-col items-center justify-center gap-4"
        header={
          <>
            <AppLogo className="hidden md:flex" />
            <div className="md:absolute pointer-events-none inset-0 flex items-center justify-center">
              <Badge variant={"outline"} className="text-base font-semibold">
                {user.organization.name}
              </Badge>
            </div>
            <HeaderRight />
          </>
        }
      >
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
                  <></>
                )}
              </>
            )}
          </>
        )}
      </BodyFrame>
    </Protected>
  );
};
