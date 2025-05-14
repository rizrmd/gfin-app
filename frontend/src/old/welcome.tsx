import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";
import { Button } from "@/components/ui/button";

export default () => {
  return (
    <OnboardFrame className="items-center justify-center">
      <AppLogo className={cn("mb-20")} />
      <div className="mb-6 text-center text-3xl font-semibold text-black">
        Hey! We're excited to Welcome you to GoFundItNow.
        <br />
        We have a couple questions to customize your experience
      </div>
      <p className="mb-8 text-center text-base text-[#202020]">
        Ready to get started?
      </p>

      <Button className="px-28 py-4 " href="/org/onboarding">
        Let's Get Started
      </Button>
    </OnboardFrame>
  );
};
