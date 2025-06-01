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
            const prompt = `\
              `;
            console.log(prompt);
            const res = await ai.task.do("opportunity_detail", {
              // system: `You are an expert in finding grants and funding opportunities for technology companies, especially in the field of AI. only output in JSON format like this: ${JSON.stringify(
              //   [
              //     {
              //       funder: "",
              //       amount: { from: "", to: "" },
              //       deadline: "",
              //       link: "",
              //       categories: [""],
              //     },
              //   ]
              // )}`,
              // system: `
              //   help me find the data of a company based on these data :
              //   First Name: Joel
              //   Last Name: Gascoigne
              //   Company: Buffer
              //   Email: hello@buffer.com
              //   URL: buffer.com
              //   `,
              system: `
                help me find the detail of a funding opportunity based on these data :
                {
                  "funder": "Homegrown Capital",
                  "amount": { "from": "$500,000", "to": "$2,000,000" },
                  "deadline": "Rolling",
                  "link": "https://homegrown.capital/",
                  "categories": ["B2B Software", "AgTech", "FinTech", "Media", "Seed", "Series A"]
                }
                `, 
              prompt,
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
