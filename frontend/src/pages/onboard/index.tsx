import { AppLogo } from "@/components/app/logo";
import { AiConversationBox } from "@/components/custom/ai/conv-box";
import { TaskProgress } from "@/components/custom/ai/task-progress";
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
  const { permission, phase, qa_final: qa_session, start, messages } = ai.local;

  const qa_len = Object.keys(qa_session).length;
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
            <TaskProgress />
          </>
        }
      >
        <Card className="flex flex-col justify-center p-2 w-[94%] absolute h-[80vh] top-[10px] md:relative mt-10 md:mt-0 md:min-h-[400px] md:h-[60vh] md:w-[400px]  border-0">
          <div className="absolute -top-9 -ml-2 select-none items-start flex w-full justify-between">
            <div className="flex gap-2">
              <span className="font-extrabold">Onboard</span>
              {permission === "granted" ? (
                <div className="font-light">
                  {!phase.qa ? <span>Q&A</span> : "Profile"}{" "}
                </div>
              ) : (
                <span className="font-light">Starting...</span>
              )}
            </div>

            {permission === "granted" && (
              <>
                {!phase.qa ? (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-indigo-800 hover:text-white transition-all"
                  >
                    {!qa_len ? "~" : qa_len} of {questions.length} questions
                  </Badge>
                ) : (
                  <></>
                )}
              </>
            )}
          </div>
          {permission === "granted" && (
            <>{!phase.qa && !phase.profile && <AiConversationBox ai={ai} />}</>
          )}
          {permission !== "requesting" &&
            (permission === "pending" || messages.length === 0) && (
              <div className="flex items-center flex-1 justify-center select-none">
                <div className="flex items-bottom gap-2">
                  <Bot />
                  <TextShimmer>Initializing...</TextShimmer>
                </div>
              </div>
            )}
          {permission === "requesting" && (
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
          {permission === "denied" && (
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
                    start();

                    if (permission === "denied") {
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
