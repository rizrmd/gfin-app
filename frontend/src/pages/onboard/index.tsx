import { AppLogo } from "@/components/app/logo";
import { AiConversationBox } from "@/components/custom/ai/conv-box";
import { ConversationQA } from "@/components/custom/ai/onboard/conversation-qa";
import { SummaryQA } from "@/components/custom/ai/onboard/summary-qa";
import { HeaderRight } from "@/components/custom/ai/header-right";
import { TextShimmer } from "@/components/custom/ai/text-shimmer";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { aiOnboard, questions } from "@/lib/ai/onboard";
import { Protected, user } from "@/lib/user";
import { ArrowRight, Bot, Mic } from "lucide-react";

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
        {ai.local.summary ? <SummaryQA ai={ai} /> : <ConversationQA ai={ai} />}
      </BodyFrame>
    </Protected>
  );
};
