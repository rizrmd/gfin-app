import { AppLogo } from "@/components/app/logo";
import { AiConversationBox } from "@/components/custom/ai/conv-box";
import { TaskProgress } from "@/components/custom/ai/task-progress";
import { TextShimmer } from "@/components/custom/ai/text-shimmer";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { aiOnboardConv } from "@/lib/ai/onboard-conv";
import { Protected, user } from "@/lib/user";
import { ArrowRight, Mic } from "lucide-react";
export default () => {
  const ai = aiOnboardConv();

  return (
    <Protected>
      <BodyFrame
        className="flex flex-col items-center justify-center gap-4"
        header={
          <>
            <AppLogo />
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge variant={"outline"} className="text-base font-semibold">
                {user.organization.name}
              </Badge>
            </div>
            <TaskProgress />
          </>
        }
      >
        <Card className="flex items-center justify-center p-2 relative  min-h-[400px] h-[60vh] w-[400px]  border-0">
          {ai.permission === "granted" && <AiConversationBox ai={ai} />}
          {ai.permission === "requesting" && (
            <div className="flex flex-col items-stretch px-10 justify-center gap-10">
              <div className="text-3xl font-bold">
                Hello <span className="font-light">{user.fullName}</span>,
              </div>

              <TextShimmer>
                To begin your conversation with ARTEMIS, please grant microphone
                access.
              </TextShimmer>

              <Badge className="flex items-center">
                <Mic />
                Waiting for microphone access...
              </Badge>
            </div>
          )}
          {ai.permission === "denied" && (
            <div className="flex flex-col items-stretch px-10 justify-center gap-10">
              <div className="text-3xl font-bold">
                Hello <span className="font-light">{user.fullName}</span>,
              </div>

              <div>
                It seems your microphone access was denied. We use voice input
                to enhance your experience.
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  className="flex flex-col h-auto items-start"
                  onClick={() => {
                    ai.restart();

                    if (ai.permission === "denied") {
                      Alert.info(
                        "You may need to reset permission in your browser to access your microphone."
                      );
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Mic className="min-w-[24px] min-h-[24px]" />
                    <span className="flex flex-col flex-1 items-start">
                      <div>Enable Mic Access</div>
                      <small>and use voice agent to start onboarding</small>
                    </span>
                  </div>
                </Button>

                <Button variant={"secondary"}>
                  <ArrowRight />
                  <span>Continue Manually</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </BodyFrame>
    </Protected>
  );
};
