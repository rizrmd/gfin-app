import { RegisterForm } from "@/components/custom/register-form";

export default () => {
  return (
    <div
      className={cn(
        "flex items-stretch justify-center min-h-screen bg-gray-100 flex-col lg:flex-row",
        css`
          background-image: url("/images/bg-register.jpg");
          background-size: cover;
        `
      )}
    >
      <div 
        className={cn(
          "page-form--details flex-1 pt-25 pb-10 lg:py-10 hidden lg:flex",
          css`
            flex-direction: column;
            justify-content: space-evenly;
          `
        )}>
        <div className="auth_title px-6 lg:pl-10 text-neutral-50">
          <h2 className={cn(
            "text-3xl lg:text-4xl font-bold max-w-[450px] leading-tight mb-5",
            css`
              line-height: 1.3;
            `
            )}>
              The Simplest way to Get and Manage your Contracts and Grants Online
          </h2>        
        </div>

        <div className="image p-10 pl-0">
          <img
            src="/images/dashboard.png"
            alt="Illustration"
            className={cn(
              "w-full h-auto max-w-[550px]",
              css`
                border-radius: 0px 15px 15px 0px;         
              `
            )}
          />
        </div> 
        <div className="terms flex items-start justify-start gap-3.5 p-10 font-medium text-neutral-200">
          <div><a href="">Terms</a></div>
          <div><a href="">Privacy</a></div>
          <div><a href="">Docs</a></div>
        </div>
      </div>

      {/* Form Section */}
      <div className="page-form--form flex-1 flex items-center justify-center">
        <div className={cn(
          "w-full max-w-[90%] bg-white flex items-center justify-center lg:p-20 lg:pt-5 lg:pb-1 lg:w-fit",
          css`
            margin: 20px;
            border-radius: 35px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          `
        )}>
          <div className="p-4 lg:p-8 w-full max-w-md ">
            <div className="logo mb-4">
              <img 
                src="/images/logo.png"
                alt="logo"
                className={cn(
                  "mx-auto w-auto h-auto max-w-[180px]",
                  css`
                            
                  `
                )}
              />
            </div>
            <div className="content">
                <h2 className={cn(
                    "text-xl lg:text-2xl font-bold mb-2 text-left",
                    css`
                      text-align: left;
                    `
                  )}
                >
                  Create an Account
                </h2>
                <p className="text-sm text-gray-600 mb-7">
                  Create your GoFundItNow account. We require a work email address when signing up for an account.
                </p>
            </div>

            <RegisterForm />

            <div className="form_footer">
              <p className="text-sm lg:text-base text-gray-600 mt-7 mb-7 text-center">
                By continuing, you agree to GoFundItNow {" "}
                <a href="/terms" className="text-blue-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </a>
              </p>
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Sign in
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
