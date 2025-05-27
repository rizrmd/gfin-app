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
            await user.init();
            const res = await ai.task.do("ask", {
              prompt: "hello tell me the cutest animal",
            });
            console.log(res);
          }}
        >
          Mantap jiwa
        </Button>
      </div>
    </>
  );
};
