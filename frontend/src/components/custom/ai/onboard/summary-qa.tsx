import { AppLoading } from "@/components/app/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { questions, type useAiOnboard } from "@/lib/ai/onboard";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { user } from "@/lib/user";
import { CheckCircle, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { type FC } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";

export const SummaryQA: FC<{
  ai: ReturnType<typeof useAiOnboard>;
  len: number;
}> = ({ ai }) => {
  const qa_final = { ...ai.local.qa_final };
  for (const q of questions) {
    if (!qa_final[q]) {
      qa_final[q] = "";
    }
  }
  const local = useLocal({
    saving: false,
    changed: false,
  });

  return (
    <Card className="flex rounded-none relative flex-col justify-center max-w-[800px] w-[90%] h-[80vh] ">
      <div
        className={cn(
          "absolute -inset-1 z-0 rounded-lg blur transition-all pointer-events-none",
          !local.saving && ai.local.queried
            ? "opacity-0 duration-[2s]"
            : "opacity-25  animate-pulse bg-gradient-to-r from-red-600 to-violet-600 "
        )}
      ></div>
      <div className="absolute -top-7 select-none items-start flex w-full justify-between">
        {ai.local.mode === "auto" && !ai.local.phase.qa && (
          <Badge
            variant="default"
            onClick={() => {
              ai.local.summary = false;
              ai.local.render();
            }}
            className="cursor-pointer"
          >
            <ChevronLeft />
            Back
          </Badge>
        )}

        <div className="flex gap-2">
          <span className="font-extrabold">Summary</span>
          <div className="font-light">
            <span>Q&A</span>
          </div>
          <Badge variant={"outline"}>
            {Object.keys(ai.local.qa_final).length} of {questions.length}{" "}
            questions
          </Badge>
        </div>

        {local.saving && <Badge variant="secondary">Saving... </Badge>}
        {!local.changed &&
          !local.saving &&
          Object.keys(ai.local.qa_final).length >= questions.length && (
            <>
              <Button
                variant="default"
                className="-mt-[10px]"
                size="sm"
                onClick={async () => {
                  if (ai.conv.getId()) {
                    await ai.conv.endSession();
                  }
                  ai.local.summary = false;
                  ai.local.phase.qa = true;
                  ai.local.render();
                }}
              >
                <span>Next</span>
                <ChevronRight />
              </Button>
            </>
          )}
        {local.changed && !local.saving && (
          <Button
            size="xs"
            className="min-w-[70px] rounded-sm"
            variant="default"
            onClick={async () => {
              local.changed = false;
              local.saving = true;

              let qa_update = { ...qa_final };
              for (const q in qa_final) {
                if (
                  typeof qa_final[q] === "string" &&
                  qa_final[q] !== "null" &&
                  qa_final[q].trim().length > 0
                ) {
                  ai.local.qa_final[q] = qa_final[q];
                } else {
                  delete ai.local.qa_final[q];
                  delete qa_update[q];
                }
              }

              local.render();
              await api.ai_onboard({
                mode: "update",
                id: user.organization.id!,
                questions: qa_update,
              });

              local.changed = false;
              local.saving = false;
              local.render();

              toast.success(
                <div className="bg-green-100 text-green-800 flex items-center gap-2 rounded-lg border-2 border-green-500 p-4 absolute inset-0">
                  <CheckCircle size={20} />
                  <div className="text-sm">Saved successfully</div>
                </div>
              );
            }}
          >
            <Save />
            Save
          </Button>
        )}
      </div>
      <div className="flex flex-col items-stretch overflow-auto bg-white absolute inset-0 z-10">
        {!ai.local.queried ? (
          <AppLoading />
        ) : (
          <>
            {questions.map((q, idx) => {
              let a = "";
              if (!!qa_final[q]) {
                a = qa_final[q] || "";
              }

              return (
                <div
                  key={q}
                  className={cn(
                    "flex flex-row",
                    idx > 0 && " border-t",
                    a.trim() && "bg-green-50"
                  )}
                >
                  <div className="select-none border-r w-[50px] text-lg flex items-center justify-center">
                    {a.trim() ? (
                      <CheckCircle size={20} className="text-green-700" />
                    ) : (
                      <div>{idx + 1}</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex gap-2">
                      <span className="font-semibold text-lg p-3 pb-0">
                        {q}
                      </span>
                    </div>

                    <TextareaAutosize
                      value={a}
                      className="border p-3 m-2 bg-white hover:bg-blue-50 outline-none focus:bg-blue-50 focus:border-blue-600 rounded-md disabled:bg-white disabled:border-transparent"
                      disabled={local.saving}
                      onChange={(e) => {
                        ai.local.qa_final[q] = e.currentTarget.value;
                        qa_final[q] = e.currentTarget.value;
                        local.changed = true;
                        ai.local.render();
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </Card>
  );
};
