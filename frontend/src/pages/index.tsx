import { AppLogo } from "@/components/app/logo";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { navigate } from "@/lib/router";
import { user } from "@/lib/user";
import { useEffect } from "react";

export default () => {
  useEffect(() => {
    user.init().then(() => {
      if (user.status === "logged-in") {
        navigate("/onboard/unused/old");
      } else if (user.status === "logged-out") {
        navigate("/auth/login/");
      }
    })
  }, []);

  return (
    <BodyFrame className="flex flex-col items-center justify-center">
      <AppLogo large />
    </BodyFrame>
  );
};
