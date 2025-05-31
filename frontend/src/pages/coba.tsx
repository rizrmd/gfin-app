import { Button } from "@/components/ui/button";
import { useAI } from "@/lib/ai/use-ai";

export default () => {
  const ai = useAI();

  return (
    <>
      Hello coba.tsx
      <div>
        <Button
          onClick={async () => {
            // await user.init();
            // const res = await ai.task.do("groq", {
            //   prompt: `get latest contract opportunity`,
            // });
            // const prompt = `\
            //   I have technology company that is looking for grants based in USA. I specialized in AI technology, please provide me the funder, amount, link to apply to this opportinities. If any are missing or link is not correct do not display. Find at least 10 grants `;
            // console.log(prompt);
            // const res = await ai.task.do("deepseek", {
            //   system: `You are an expert in finding grants and funding opportunities for technology companies, especially in the field of AI. only output in JSON format like this: ${JSON.stringify(
            //     [
            //       {
            //         funder: "",
            //         amount: { from: "", to: "" },
            //         deadline: "",
            //         link: "",
            //         categories: [""],
            //       },
            //     ]
            //   )}`,
            //   prompt,
            // });
          }}
        >
          SAM.GOV
        </Button>
      </div>
    </>
  );
};
