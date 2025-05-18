import { AppLogo } from "@/components/app/logo";
import { RegisterForm } from "@/components/custom/auth/register-form";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { navigate } from "@/lib/router";
import { PublicOnly, user } from "@/lib/user";

export default () => {
  return (
    <BodyFrame className="flex flex-col items-center justify-center">
      <AppLogo large />
      <Card className="min-w-[400px] mt-10 p-7 pb-2">
        <PublicOnly>
          <RegisterForm
            onSubmit={async (form) => {
              try {
                const res = await api.register(form);
                if (res.client && res.organization) {
                  user.init(res);
                  form.loading = false;
                  navigate("/onboard/");
                }
              } catch (e) {
                await Alert.info(e.message);
                form.loading = false;
              }
            }}
          />
        </PublicOnly>
      </Card>
    </BodyFrame>
  );
};
