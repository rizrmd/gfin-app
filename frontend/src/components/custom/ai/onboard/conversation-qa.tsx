import { AiConversationBox } from "@/components/custom/ai/conv-box";
import { TextShimmer } from "@/components/custom/ai/text-shimmer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import type { useAiOnboard } from "@/lib/ai/onboard";
import { questions } from "@/lib/ai/onboard";
import { user } from "@/lib/user";
import { ArrowRight, Bot, Mic, Pause, Play } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { api } from "@/lib/gen/api";
import { useAI } from "@/lib/ai/use-ai";

export const ConversationQA: FC<{
  ai: ReturnType<typeof useAiOnboard>;
}> = ({ ai }) => {
  const ai_profile = useAI();
  const [orgProfile, setOrgProfile] = useState<any>(null);
  const {
    permission,
    phase,
    qa_final: qa_session,
    start,
    messages,
    summary,
  } = ai.local;

  useEffect(() => {
    console.log("Messages:", messages);
    console.log("Permission:", permission);
    console.log("Phase:", phase);
  }, [messages, permission, phase]);
  // useEffect(() => {
  //   if (
  //     typeof user.organization?.id === "string" &&
  //     user.organization.id.length > 0
  //   ) {
  //     // Fetch organization profile and set to state
  //     api["ai_get-profile"]({ organizationId: user.organization.id }).then((res) => {
  //       setOrgProfile(res?.data || {});
  //       // Removed ai.local.formData assignment to fix error
  //       ai.local.render();
  //     });
  //     ai_profile.task.do("update_org_profile", {
  //       id_org: user.organization.id,
  //       prompt: "Find the latest information about this organization.",
  //       system:
  //         "You are an expert in gathering verified information about organizations.",
  //     });
  //   }
  // }, []);

  const qa_len = Object.keys(qa_session).length;
  return (
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
            {ai.conv.status === "connected" ? (
              <Button
                variant={!ai.local.paused ? "outline" : "default"}
                size="xs"
                className={cn(ai.local.paused && "bg-black text-white")}
                onClick={async () => {
                  ai.conv.endSession();
                  ai.local.pause();
                }}
              >
                <>
                  <Pause />
                  Pause
                </>
              </Button>
            ) : (
              <>
                {!ai.local.paused && (
                  <div className="text-xs text-slate-500 mt-1">
                    Gathering thought...
                  </div>
                )}
              </>
            )}

            {!phase.qa ? (
              <Badge
                variant="secondary"
                onClick={() => {
                  ai.local.summary = true;
                  ai.local.render();
                }}
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
        <>
          {!summary && (
            <>
              {!phase.qa && !phase.profile && (
                <AiConversationBox ai={ai} len={messages.length} />
              )}
            </>
          )}
        </>
      )}
      {((messages.length === 0 &&
        !["denied", "requesting"].includes(permission)) ||
        permission === "pending") && (
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
            It seems your microphone access was denied. We use voice input to
            enhance your experience.
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

            <Button
              variant={"secondary"}
              onClick={() => {
                ai.local.chooseMode("manual");
                ai.local.render();
              }}
            >
              <ArrowRight />
              <span>Continue Manually</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
