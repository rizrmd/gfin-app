import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";
import { Button } from "@/components/ui/button";
import { useAI } from "@/lib/ai/use-ai";
import { navigate } from "@/lib/router";
import { Protected, user } from "@/lib/user";

export default () => {
  const ai = useAI();
  return (
    <Protected>
      <OnboardFrame className="flex flex-col items-center justify-center gap-4">
        <AppLogo />
        Hello welcome.tsx
        <Button
          onClick={async () => {
            ai.task.do("search_org", {
              orgName: user.organization.name!,
              state: user.organization.data!.filingInformation.state,
            });
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
      </OnboardFrame>
    </Protected>
  );
};
