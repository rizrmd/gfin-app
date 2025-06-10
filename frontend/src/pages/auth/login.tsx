import { AppLogo } from "@/components/app/logo";
import { LoginForm } from "@/components/custom/auth/login-form";
import { OtpInput } from "@/components/custom/auth/otp-input";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { Link } from "@/lib/router";
import { PublicOnly, user } from "@/lib/user";

export default () => {
  const local = useLocal({
    showOtpModal: false,
    form: {
      loading: false,
      email: "",
    },
  });

  const handleLogin = async () => {
    
    // Set loading state from the form
    local.form.loading = true;
    local.render();
    try {
      // Call the login API which will send an OTP
      const loginResponse = await api.auth_login({
        email: local.form.email,
        from: location.hostname,
      });

      if (loginResponse.success) {
        if (loginResponse.otp) {
          handleVerifyOtp(loginResponse.otp);
        } else {
          // Show OTP input dialog
          local.showOtpModal = true;
          local.form.loading = false;
          local.render();
        }
      } else {
        Alert.info(
          "Login failed" +
            (loginResponse.message || "Could not send verification code")
        );
        local.form.loading = false;
        local.render();
      }
    } catch (error: any) {
      await Alert.info("Login failed", error.message);
      local.form.loading = false;
      local.render();
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    local.form.loading = true;
    local.render();

    try {
      // Verify the OTP
      const verifyResponse = await api.auth_verify_otp({
        email: local.form.email,
        otp,
        userAgent: navigator.userAgent,
        ipAddress: "", // The server will get this from the request
      });

      if (verifyResponse.success) {
        local.showOtpModal = false;

        // Initialize user with the token and user data
        await user.init({
          token: verifyResponse.token,
          user: verifyResponse.user,
        });

        location.href = "/onboard/unused/old";
      } else {
        await Alert.info(
          "Verification failed:" +
            "Invalid verification code. Please try again."
        );

        local.form.loading = false;
        local.render();
      }
    } catch (error: any) {
      await Alert.info("Verification failed", error.message);

      local.form.loading = false;
      local.render();
    }
  };

  const handleResendOtp = async () => {
    local.form.loading = true;
    local.render();

    try {
      await api.auth_resend_otp({ email: local.form.email });
      Alert.info(
        "Success:" + "A new verification code has been sent to your email."
      );
    } catch (error: any) {
      Alert.info("Failed to resend code", error.message);
    } finally {
      local.form.loading = false;
      local.render();
    }
  };

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
            onSubmit={handleLogin}
            form={local.form}
            onInit={(form) => {
              local.form = form;
            }}
          />

          <div className="text-sm mb-3">
            {local.form.loading ? (
              <div className="flex items-center text-slate-500">
                Do not refresh this page...
              </div>
            ) : (
              <>
                Don't have an account?{" "}
                <Link href="/auth/register" className="underline text-blue-500">
                  Sign up Now
                </Link>
              </>
            )}
          </div>
        </Card>

        {/* OTP Verification Dialog */}
        <OtpInput
          email={local.form.email}
          isOpen={local.showOtpModal}
          loading={local.form.loading}
          onSubmit={handleVerifyOtp}
          onCancel={() => {
            local.showOtpModal = false;
            local.render();
          }}
          onResend={handleResendOtp}
        />
      </PublicOnly>
    </BodyFrame>
  );
};
