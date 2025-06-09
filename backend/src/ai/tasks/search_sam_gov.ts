import { taskWorker } from "../lib/task-worker";
import { samGovTool } from "../tools";
// import { OpportunityResponse } from "../tools";

interface OpportunityResponse {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  fullParentPathName: string;
  fullParentPathCode: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  typeOfSetAsideDescription: string;
  typeOfSetAside: string;
  responseDeadLine: string | null;
  naicsCode: string;
  naicsCodes: string[];
  classificationCode: string;
  active: string;
  award: {
    date: string;
    number: string;
    amount: string;
    awardee: {
      name: string;
      location: {
        city: {
          code: string;
          name: string;
        };
        state: {
          code: string;
          name: string;
        };
        zip: string;
        country: {
          code: string;
          name: string;
        };
      };
      ueiSAM: string;
      cageCode: string;
    };
  };
  pointOfContact: Array<{
    fax: string | null;
    type: string;
    email: string;
    phone: string;
    title: string | null;
    fullName: string;
  }>;
  description: string;
  organizationType: string;
  officeAddress: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  placeOfPerformance: {
    city: {
      code: string;
      name: string;
    };
    state: {
      code: string;
      name: string;
    };
    zip: string;
    country: {
      code: string;
      name: string;
    };
  };
  additionalInfoLink: string | null;
  uiLink: string;
  links: Array<{
    rel: string;
    href: string;
  }>;
  resourceLinks: any | null;
}

export default taskWorker<
  {},
  {prompt: string; system?: string },
  { answer: OpportunityResponse[] }
>({
  name: "search_sam_gov",
  desc: "Asking",
  async execute({ agent, input}) {
    // const org = await db.organizations.findFirst({
    //   where: { id: input.id_org },
    //   select: {
    //     data: true,
    //     client: {
    //       select: {
    //         profile: true,
    //       },
    //     },
    //   },
    // });

    const tasksPrompt = `
    You are an assistant that gets information from sam.gov API in tools : samGovTool and returns a list of opportunities based on the user's query.
    You must combine your understanding of the user's intent with the correct sam.gov API structure.
    
    you must not fabricate any data. only return data provided by sam.gov API from tool : samGovTool, if tool doesnt provide any data, you must return an empty array [].

    Your output must be a pure JSON array containing objects with this exact structure:
    {
      "noticeId": string,
      "title": string,
      "solicitationNumber": string,
      "fullParentPathName": string,
      "fullParentPathCode": string,
      "postedDate": string,
      "type": string,
      "baseType": string,
      "archiveType": string,
      "archiveDate": string,
      "typeOfSetAsideDescription": string,
      "typeOfSetAside": string,
      "responseDeadLine": string | null,
      "naicsCode": string,
      "naicsCodes": string[],
      "classificationCode": string,
      "active": string,
      "award": {
        "date": string,
        "number": string,
        "amount": string,
        "awardee": {
          "name": string,
          "location": {
            "city": {
              "code": string,
              "name": string
            },
            "state": {
              "code": string,
              "name": string
            },
            "zip": string,
            "country": {
              "code": string,
              "name": string
            }
          },
          "ueiSAM": string,
          "cageCode": string
        }
      },
      "pointOfContact": [
        {
          "fax": string | null,
          "type": string,
          "email": string,
          "phone": string,
          "title": string | null,
          "fullName": string
        }
      ],
      "description": string,
      "organizationType": string,
      "officeAddress": {
        "zipcode": string,
        "city": string,
        "countryCode": string,
        "state": string
      },
      "placeOfPerformance": {
        "city": {
          "code": string,
          "name": string
        },
        "state": {
          "code": string,
          "name": string
        },
        "zip": string,
        "country": {
          "code": string,
          "name": string
        }
      },
      "additionalInfoLink": string | null,
      "uiLink": string,
      "links": [
        {
          "rel": string,
          "href": string
        }
      ],
      "resourceLinks": any | null
    }

    Guidelines:
    - Respond with an array of opportunities matching the above structure
    - Each object should represent a complete opportunity response
    - Do not include any text outside the JSON array
    - Ensure the final result is a valid JSON array that can be used directly
    - Fill in realistic and relevant values based on the user's prompt`;

    const res = await agent.perplexity_openrouter({
      system: input.system
        ? input.system
        : tasksPrompt,
      prompt: input.prompt,
      tools: [samGovTool],
      tool_choice: "required",
    });

    try {
  // Hilangkan seluruh <script>...</script> dan <style>...</style> beserta isinya
  let cleanContent = res.content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<think[^>]*>[\s\S]*?<\/think>/gi, '');

  // Hapus semua tag HTML yang tersisa
  cleanContent = cleanContent.replace(/<[^>]*>/g, '').trim();
  // console.log("Cleaned content:", cleanContent);
  const parsed = JSON.parse(cleanContent);
  if (!Array.isArray(parsed)) {
    throw new Error("Response must be an array of opportunities");
  }
  return { answer: parsed };
  } catch (e) {
    console.error(e);
    throw e;
  }

  },
});


