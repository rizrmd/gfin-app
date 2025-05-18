import { LoginForm } from "@/components/custom/login-form";

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
      <div className={cn(
          "page-form--details flex-1 pt-25 pb-10 lg:py-10 hidden lg:flex",
          css`
            flex-direction: column;
            justify-content: space-evenly;
          `
        )}>
        <div className="auth_title px-6 lg:pl-10 text-neutral-50">
          <h2 className={cn(
            "text-3xl lg:text-4xl font-bold max-w-[400px] leading-tight mb-5",
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
              css`
                max-width: 550px;
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
      <div className="page-form--form flex-1 flex items-center justify-center">
        <div className={cn(
          "w-full max-w-[90%] bg-white flex items-center justify-center lg:p-20 lg:pt-5 lg:pb-1 lg:w-fit",
          css`
            margin: 20px;
            border-radius: 35px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          `
        )}>
          <div className="p-8 w-full max-w-md">
            <div className="logo mb-4">
              <img 
                src="/images/logo.png"
                alt="logo"
                className={cn(
                  css`
                    margin: 0 auto;         
                  `
                )}
              />
            </div>
            <div className="content">
                <h2 className={cn(
                    "text-2xl font-bold mb-2",
                    css`
                      text-align: center;
                    `
                  )}
                >
                  Welcome Back.
                </h2>
                <p className="text-sm text-gray-600 mb-7 text-center">
                  Login to your GoFundItNow account. 
                </p>
            </div>

            <LoginForm />

            <div className="form_footer">
              <p className="text-1xl text-gray-600 mt-7 mb-7 text-center max-w-md">
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
                Do not have an account?{" "}
                <a href="/register" className="text-blue-500 hover:underline">
                  Register Here
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
