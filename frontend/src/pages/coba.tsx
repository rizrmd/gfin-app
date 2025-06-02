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
            // await user.init();
            // const res = await ai.task.do("groq", {
            //   prompt: `get latest contract opportunity`,
            // });
            const prompt = `\
              `;
            const res = await ai.task.do("opportunity_detail", {
              // system: `You are an expert in finding grants and funding opportunities for technology companies, especially in the field of AI. only output in JSON format like this: ${JSON.stringify(
                // [
                //   {
                //     funder: "",
                //     amount: { from: "", to: "" },
                //     deadline: "",
                //     link: "",
                //     categories: [""],
                //   },
                // ]
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
              // system: `find me the 30 latest grant opportunities for AI startups in the US`,
              prompt,
            });
            console.log(res);
          }}
        >
          find opportunity detail
        </Button>
        <Button
          onClick={async () => {
            // await user.init();
            // const res = await ai.task.do("groq", {
            //   prompt: `get latest contract opportunity`,
            // });
            const prompt = `\
              `;
            const res = await ai.task.do("opportunity_list", {
              system: `You are an expert in finding grants and funding opportunities for technology companies, especially in the field of AI. only output in JSON format like this: ${JSON.stringify(
                [
                  {
                    funder: "",
                    amount: { from: "", to: "" },
                    deadline: "",
                    link: "",
                    categories: [""],
                  },
                ]
              )}`,
              // system: `
              //   help me find the data of a company based on these data :
              //   First Name: Joel
              //   Last Name: Gascoigne
              //   Company: Buffer
              //   Email: hello@buffer.com
              //   URL: buffer.com
              //   `,
              // system: `find me the 30 latest grant opportunities for AI startups in the US`,
              prompt,
            });
            console.log(res);
          }}
        >
          find opportunity list from perplexity
        </Button>
        <Button
          onClick={async () => {
            const prompt = `\
              `;
            const res = await ai.task.do("search_sam_gov", {
              // system: `
              //   help me find the data of a company based on these data :
              //   First Name: Joel
              //   Last Name: Gascoigne
              //   Company: Buffer
              //   Email: hello@buffer.com
              //   URL: buffer.com
              //   `,
              system: `find me the 30 latest grant opportunities for AI startups in the US`,
              prompt,
            });
            console.log(res);
          }}
        >
          find opportunity list from sam.gov
        </Button>
        <Button
          onClick={async () => {
            // await user.init();
            // if (!user.organization.id) {
            //   console.error("Organization ID is undefined");
            //   return;
            // }
            ai.task.do("update_org_profile", {
              id_org: "f232f896-8a87-4542-8f6a-a7f314486708",
              prompt: "Find the latest information about this organization.",
              system:
                "You are an expert in gathering verified information about organizations.",
            });
          }}
        >
          Search org
        </Button>
        
      </div>
    </>
  );
};
