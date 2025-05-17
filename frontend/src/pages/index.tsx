import { AppLogo } from "@/components/app/logo";
import { OnboardFrame } from "@/components/custom/onboard-frame";
import { RegisterForm } from "@/components/custom/register-form";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { useAI } from "@/lib/ai/use-ai";
import { api } from "@/lib/gen/api";
import { navigate } from "@/lib/router";
import { PublicOnly, user } from "@/lib/user";

export default () => {
  return (
    <OnboardFrame className="flex flex-col items-center justify-center">
      <AppLogo />
      <Card className="min-w-[400px] mt-10 p-7 pb-2">
        <PublicOnly>
          <RegisterForm
            onSubmit={async (form) => {
              try {
                const res = await api.register(form);
                if (res.client && res.organization) {
                  user.init(res);
                  form.loading = false;
                  navigate("/onboard/welcome");
                }
              } catch (e) {
                await Alert.info(e.message);
                form.loading = false;
              }
            }}
          />
        </PublicOnly>
      </Card>
    </OnboardFrame>
  );
};
