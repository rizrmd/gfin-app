import { FlickeringGrid } from "@/components/custom/ai/flicker-grid";
import { TextShimmer } from "@/components/custom/ai/text-shimmer";
import { Badge } from "@/components/ui/badge";
import type { aiOnboard } from "@/lib/ai/onboard";
import useAudioRecorder from "@/lib/hooks/use-audio-recorder";
import { BotMessageSquare, Mic, Sparkle, User } from "lucide-react";
import { useEffect, type FC } from "react";
import TypeWriter from "typewriter-effect";
import { LiveAudioVisualizer } from "./audio/live-audio";

export const AiConversationBox: FC<{
  ai: ReturnType<typeof aiOnboard>;
}> = ({ ai }) => {
  const recorder = useAudioRecorder();

  const { conv, local } = ai;
  const { messages } = local;
  const lastAi = messages.findLast((e) => e.source === "ai");
  const lastUser = messages.findLast((e) => e.source === "user");
  const last = messages.length > 0 ? messages[messages.length - 1] : undefined;

  useEffect(() => {
    recorder.startRecording();
  }, []);

  return (
    <>
      <div
        className={cn(
          "absolute -inset-1 z-0 rounded-lg blur transition-all",
          !conv.isSpeaking
            ? "opacity-0 duration-[2s]"
            : "opacity-25  animate-pulse bg-gradient-to-r from-red-600 to-violet-600 "
        )}
      ></div>

      <div
        className={cn(
          "absolute inset-0 items-center flex justify-center z-20 rounded-lg transition-all flex-col bg-white",
          conv.isSpeaking ? "ring-1 ring-gray-900/5 p-2/10 " : "border"
        )}
      >
        <FlickeringGrid
          className={cn(
            "transition-all absolute ml-[4px] mt-[4px] mr-[-4px] duration-1000 z-10 h-full w-[370px] pointer-events-none",
            !conv.isSpeaking ? "opacity-0" : "opacity-100"
          )}
        />

        <div className="flex flex-col gap-2 w-full h-full absolute z-30 items-start justify-between">
          <div className="text-gray-900 w-full bg-white pb-3 p-7 rounded-lg text-base">
            <div className="flex w-full justify-between items-center mb-2">
              <div>
                <Badge>
                  <BotMessageSquare />
                  Artemis
                </Badge>
              </div>

              <Badge
                variant={"outline"}
                className={cn(
                  "transition-all",
                  !conv.isSpeaking ? "opacity-100" : "opacity-0"
                )}
              >
                <Mic />
                <TextShimmer>Listening</TextShimmer>
              </Badge>
            </div>

            {!last && (
              <div className="my-5 flex gap-2 items-center">
                <Sparkle size={14} />
                <TextShimmer className="text-sm">Thinking...</TextShimmer>
              </div>
            )}
            {last?.source === "ai" ? (
              <TypeWriter
                onInit={(typewriter) => {
                  typewriter.typeString(last.message).start();
                }}
                options={{ delay: 10 }}
              />
            ) : (
              <>{lastAi?.message}</>
            )}
          </div>

          {lastUser && (
            <div className="text-gray-900 w-full bg-white pt-3 p-7 pb-[50px] md:pb-7 rounded-lg text-base relative">
              {recorder.mediaRecorder && (
                <div
                  className={cn(
                    "absolute -top-[80px] left-[50%] -ml-[150px] transition-all",
                    conv.isSpeaking ? "opacity-0" : "opacity-100"
                  )}
                >
                  <LiveAudioVisualizer
                    mediaRecorder={recorder.mediaRecorder}
                    width={300}
                    height={50}
                  />
                </div>
              )}
              <Badge variant={"secondary"}>
                <User />
                You
              </Badge>
              <div className="mt-2">
                {last?.source === "user" ? (
                  <TypeWriter
                    onInit={(typewriter) => {
                      typewriter.typeString(last.message).start();
                    }}
                    options={{ delay: 10 }}
                  />
                ) : (
                  <>{lastUser?.message}</>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
