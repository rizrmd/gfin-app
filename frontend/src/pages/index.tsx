import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";
import { RegisterForm } from "@/components/custom/register-form";

export default () => {
  return (
    <OnboardFrame className="flex flex-col items-center justify-center">
      <AppLogo />
      <div className="min-w-[400px] mt-10">
        <RegisterForm />
      </div>
    </OnboardFrame>
  );
};
