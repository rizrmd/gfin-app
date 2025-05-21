import { AppLogo } from "@/components/app/logo";
import { RegisterForm } from "@/components/custom/auth/register-form";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { navigate } from "@/lib/router";
import { PublicOnly, user } from "@/lib/user";
import { useEffect } from "react";

export default () => {
  useEffect(() => {
    user.init();

    console.log(user.status)
    if (user.status === "logged-in") {
      navigate("/onboard/");
    } else if (user.status === "logged-out") {
      navigate("/auth/login/");
    }
  }, []);

  return (
    <BodyFrame className="flex flex-col items-center justify-center">
      <AppLogo large />
    </BodyFrame>
  );
};
