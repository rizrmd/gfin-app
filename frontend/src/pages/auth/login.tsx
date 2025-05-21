import { AppLogo } from "@/components/app/logo";
import { LoginForm } from "@/components/custom/auth/login-form";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { Link, navigate } from "@/lib/router";
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
                <span>In</span>
              </div>
            </div>
            <div className="text-slate-500 flex-1 text-sm">
              We will send OTP to your email
            </div>
          </div>
          <LoginForm
            onSubmit={async (form) => {
              form.loading = true;
              try {
                // await api.login();
                navigate("/");
              } catch (error) {
                Alert.info("Login failed:", error);
              } finally {
                form.loading = false;
              }
            }}
          />
          <div className="text-sm mb-3">
            Don't have an account?{" "}
            <Link href="/auth/register" className="underline text-blue-500">
              Sign up Now
            </Link>
          </div>
        </Card>
      </PublicOnly>
    </BodyFrame>
  );
};
