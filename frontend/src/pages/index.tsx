import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";
import { RegisterForm } from "@/components/custom/register-form";
import { Card } from "@/components/ui/card";
import { useAI } from "@/lib/ai/use-ai";

export default () => {
  const ai = useAI();
  return (
    <OnboardFrame className="flex flex-col items-center justify-center">
      <AppLogo />
      <Card className="min-w-[400px] mt-10 p-7 pb-2">
        <RegisterForm onSubmit={(form) => {}} />
      </Card>
    </OnboardFrame>
  );
};
