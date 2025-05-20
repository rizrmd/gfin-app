import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { aiOnboard } from "@/lib/ai/onboard";
import { user } from "@/lib/user";
import type { FC } from "react";

export const PickMode: FC<{
  ai: ReturnType<typeof aiOnboard>;
  len: number;
}> = ({ ai }) => {
  return (
    <Card className="flex relative flex-col justify-center w-[400px] h-[400px] ">
      <div
        className={cn(
          "absolute -inset-1 z-0 rounded-lg blur transition-all pointer-events-none",
          "opacity-25  animate-pulse bg-gradient-to-r from-red-600 to-violet-600 "
        )}
      ></div>
      <div className="absolute bg-white inset-0 flex flex-col rounded-lg p-6 items-stretch">
        <div className="text-3xl font-bold">
          Hello <span className="font-light">{user.fullName},</span>
        </div>
        <div>Please choose how do you want to proceed</div>
        <div className="flex gap-6 flex-col flex-1 justify-center">
          <Button
            className={cn(
              "flex flex-col items-start h-auto gap-0 py-8 group relative group border-0 rounded-2xl ",
              "shadow-none hover:shadow-lg hover:shadow-[#8cb3f1] transition-all duration-200 hover:translate-x-1 hover:-translate-y-1 ",
              "bg-gradient-to-r from-[#818cf8] via-[#3b82f6] to-[#4f46e5]"
            )}
            onClick={() => {
              ai.local.chooseMode("auto");
            }}
          >
            <div className="text-xl flex flex-row gap-2">
              <div className="font-bold">ARTEMIS</div>
              <div className="font-light">Live Agent</div>
            </div>
            <div className="text-sm font-light">
              Start live conversation with our AI Agent.
            </div>
          </Button>
          <Button
            className={cn(
              "flex flex-col items-start h-auto gap-0 relative group border-2 rounded-2xl",
              "shadow-none hover:shadow-lg hover:border-transparent hover:shadow-[#8cb3f1] transition-all duration-200 hover:translate-x-1 hover:-translate-y-1"
            )}
            variant="secondary"
            onClick={() => {
              ai.local.chooseMode("manual");
            }}
          >
            <div className="text-xl flex flex-row gap-2">
              <div className="font-bold">Manual</div>
              <div className="font-light">Filling</div>
            </div>
            <div className="text-sm font-light">
              Fill out the form manually.
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
};
