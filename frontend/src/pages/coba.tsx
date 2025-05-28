import { Button } from "@/components/ui/button";
import { useAI } from "@/lib/ai/use-ai";
import { user } from "@/lib/user";

export default () => {
  const ai = useAI();
  return (
    <>
      Hello coba.tsx
      <div>
        <Button
          onClick={async () => {
            console.log("Initializing user...");
            await user.init();
            const res = await ai.task.do("sam_gov", {
              prompt:      
              `user prompt : Find 30 latest opportunities on SAM.gov`,
            });
            console.log(res);
          }}
        >
          SAM.GOV
        </Button>
      </div>
    </>
  );
};
