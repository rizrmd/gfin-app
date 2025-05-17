import { AppLogo } from "@/components/app/logo";
import { BodyFrame } from "@/components/custom/body-frame";
import { Button } from "@/components/ui/button";
import { useAI } from "@/lib/ai/use-ai";
import { navigate } from "@/lib/router";
import { Protected, user } from "@/lib/user";

export default () => {
  const ai = useAI();
  return (
    <Protected>
      <BodyFrame className="flex flex-col items-center justify-center gap-4">
        <AppLogo />
        Hello welcome.tsx
        <Button
          onClick={async () => {
            const res = await ai.task.do("search_org", {
              orgName: user.organization.name!,
              state: user.organization.data!.filingInformation.state,
            });
            console.log(res);
          }}
        >
          Trigger search organization profile
        </Button>
        <Button
          onClick={() => {
            user.logout();
            navigate("/");
          }}
        >
          Logout
        </Button>
      </BodyFrame>
    </Protected>
  );
};
