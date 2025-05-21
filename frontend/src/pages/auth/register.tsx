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
      <PublicOnly>
        <Card className="min-w-[400px] mt-10 p-7 pb-2 relative">
          <div className="absolute -top-[50px] -mx-7 select-none flex w-full flex-col items-center">
            <AppLogo large />
          </div>

          <div className="flex mb-[30px] gap-1 flex-col">
            <div className="flex mt-[5px] gap-2 text-4xl">
              <span className="font-extrabold">Sign</span>
              <div className="font-light">
                <span>Up</span>
              </div>
            </div>
            <div className="text-slate-500 flex-1 text-sm">
              Find new grants and contracts opportunities.
            </div>
          </div>

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
        </Card>
      </PublicOnly>
    </BodyFrame>
  );
};
