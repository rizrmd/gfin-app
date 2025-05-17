import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";

export default () => {
  return (
    <OnboardFrame className="flex flex-col items-center justify-center">
      <AppLogo />
    </OnboardFrame>
  );
};
