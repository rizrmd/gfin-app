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
              `user prompt : Find opportunities for any grants posted from 01/01/2025 until now`,
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
