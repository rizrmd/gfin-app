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
            const prompt = `\ `;
            const res = await ai.task.do("opportunity_detail", {
              system: 
                `help me find the detail of a funding opportunity based on these data :
                {
                  "funder": "DoD SBIR 2025.1",
                  "amount": {
                    "from": "$250,000",
                    "to": "$2,000,000"
                  },
                  "deadline": "2025-02-05",
                  "link": "https://www.ebhoward.com/unlock-funding-opportunities-sbir-solicitations-open-across-federal-agencies/",
                  "categories": ["AI-Enabled Systems", "Sensor Technologies"]
                }`,
              prompt,
            });
            console.log(res);
          }}
        >
          find opportunity detail
        </Button>
        <Button
          onClick={async () => {
            const prompt = `\ `;
            const res = await ai.task.do("opportunity_list", {
              system: `You are an expert in finding grants and funding opportunities for Sierra Nevada Corporation, especially in the field of AI. only output in JSON format like this: ${JSON.stringify(
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
              prompt,
            });
            console.log(res);
          }}
        >
          find opportunity list from perplexity
        </Button>
        <Button
          onClick={async () => {
            const prompt = `\ `;
            const res = await ai.task.do("search_sam_gov", {
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
            const res = await ai.task.do("update_org_profile", {
              id_org: "f232f896-8a87-4542-8f6a-a7f314486708",
              prompt: "Find the latest information about this organization.",
              system:
                "You are an expert in gathering verified information about organizations.",
            });
            console.log(res);
          }}
        >
          Update organization profile
        </Button>
        <Button
          onClick={async () => {
            // await user.init();
            // if (!user.organization.id) {
            //   console.error("Organization ID is undefined");
            //   return;
            // }
            const res = await ai.task.do("check_requirement", {
              id_org: "f232f896-8a87-4542-8f6a-a7f314486708",
              prompt: 
              `find the requirements for this opportunity: {
                "company_name": "Department of Defense (DoD)",
                "grant_amount": "Awards range from $250,000 for Phase I feasibility studies to $2,000,000 for Phase II prototype development projects",
                "fields_of_work": ["AI-Enabled Autonomous Systems", "Sensor Technologies", "Trusted AI and Autonomy", "Radar Signal Processing", "Undersea Warfare Systems"],
                "application_types": ["Phase I Research Proposals", "Direct to Phase II Prototype Development"],
                "overview": "The DoD SBIR 2025.1 program funds innovative research projects addressing national defense needs, with pre-release starting December 4, 2024, submissions open January 8, 2025, and closing February 5, 2025. Focus areas include AI/ML-enabled systems, sensor technologies, and integrated network systems-of-systems.",
                "funding_uses": "Research and development of defense technologies including AI-enabled autonomous maneuver systems, radar signal processing improvements, multi-sensor contact localization systems, and dual-use technology commercialization",
                "location_of_projects": "United States-based research and development facilities",
                "location_of_residence": "Principal investigators must be primarily employed by U.S.-registered small businesses",
                "url": "https://www.dodsbirsttr.mil/submissions/solicitation-documents/active-solicitations",
                "contact_information": {
                  "address": "Department of Defense SBIR/STTR Program Office, 8725 John J. Kingman Road, Fort Belvoir, VA 22060-6218",
                  "email": "DoDSBIRSupport@reisystems.com",
                  "phone": "(703) 214-1333"
                },
                "key_people": ["Susan Celis (DoD SBIR/STTR Program Manager)", "Jennifer Thabet (DARPA Small Business Programs Office Director)", "Mina Khalil (USSOCOM SBIR/STTR Program Manager)"]
              }
              `,
              system:
                "You are an expert in gathering verified information about opportunity application.",
            });
            console.log(res);
          }}
        >
          Check opportunity requirement
        </Button>
        
      </div>
    </>
  );
};
