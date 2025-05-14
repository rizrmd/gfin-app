import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";
import { OnboardFirstForm } from "@/components/custom/onboarding/first-form";
import { onboard } from "@/lib/ai-onboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";

export default () => {
  const read = useSnapshot(onboard);

  useEffect(() => {
    // read.sync.init();
  }, []);

  return (
    <OnboardFrame className="items-stretch">
      <div className="flex p-4 bg-white border-b">
        <AppLogo />
      </div>
      <div className="flex-1 flex items-center justify-center">
        {read.step === "first_form" && (
          <div className="w-[400px] flex flex-col">
            <div className="text-xl pb-5">Tell us about your Organization</div>
            <Card className="w-full h-full flex">
              <CardContent className="flex-1 pt-5 items-stretch justify-center flex flex-col">
                <OnboardFirstForm />
              </CardContent>
            </Card>
          </div>
        )}
        {read.step === "search_by_name_state" && (
          <div className="w-[600px] flex flex-col">
            <div className="text-xl pb-2 flex items-end gap-2 justify-between">
              {read.agent.done ? (
                <>Information Found</>
              ) : (
                <>
                  <div className="flex items-center gap-2 ">
                    <div>
                      <Spinner size={30} />
                    </div>
                    <div>Finding information...</div>
                  </div>
                  <div className="mx-3">
                    <Timer />
                  </div>
                </>
              )}
            </div>
            <Card className="w-full h-full flex">
              <CardContent className="flex-1 p-0 pt-1 items-stretch justify-center flex flex-col">
                <Table className="border-b">
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-bold w-[120px]">
                        Entity Name
                      </TableCell>
                      <TableCell className="capitalize">
                        {read.org.entry.name}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-bold">State</TableCell>
                      <TableCell>{read.org.entry.state}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                {read.agent.done ? (
                  <pre className="text-xs p-3">
                    {JSON.stringify(read.agent.result, null, 2)}
                  </pre>
                ) : (
                  <>
                    <div
                      className={cn(
                        "flex flex-row transition-all overflow-hidden"
                      )}
                    >
                      <div className="border-r min-w-[80px] flex items-center justify-center font-extrabold flex-col">
                        <div>{(read.agent.step / 10) * 100}%</div>
                      </div>
                      <Skeleton
                        className={cn(
                          "flex-1 break-words whitespace-pre-wrap font-mono text-sm p-4 rounded-none flex items-center",
                          css`
                            min-height: 70px;
                            width: min-content;
                            white-space: break-space;
                            word-break: break-all;
                          `
                        )}
                      >
                        <Typewriter text={read.agent.goal} speed={10} />
                      </Skeleton>
                    </div>
                    <div className="flex border-t p-4">
                      <Button
                        variant={"secondary"}
                        onClick={async () => {
                          if (
                            (
                              await Alert.confirm(
                                "Are you sure you want to cancel the search?"
                              )
                            ).confirm
                          ) {
                            onboard.agent.step = 0;
                            onboard.agent.goal = "";
                            onboard.agent.done = true;
                            onboard.agent.result = null;
                            onboard.step = "first_form";

                            read.sync.send({
                              task: "cancel",
                            });
                          }
                        }}
                      >
                        Cancel Search
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </OnboardFrame>
  );
};

const Timer = () => {
  const [now, render] = useState(Date.now());
  const read = useSnapshot(onboard);

  useEffect(() => {
    const interval = setInterval(() => {
      render(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xs font-normal">
      {Math.round((now - read.agent.ts) / 100) / 10}s
    </div>
  );
};

const Typewriter = ({ text, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const timeout = useRef(null as any);

  useEffect(() => {
    setDisplayedText("");
    setIndex(0);
    clearTimeout(timeout.current);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      timeout.current = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[index]);
        setIndex((prevIndex) => prevIndex + 1);
      }, speed);

      return () => clearTimeout(timeout.current);
    }
  }, [index, speed]);

  return <span>{displayedText}</span>;
};
