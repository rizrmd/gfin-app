import { RegisterForm } from "@/components/custom/register-form";

export default () => {
  return (
    <div
      className={cn(
        "flex items-stretch justify-center min-h-screen bg-gray-100",
        css`
          background-image: url("/images/bg-register.jpg");
          background-size: cover;
        `
      )}
    >
      <div className="flex-1"></div>
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
          <h2
            className={cn(
              "text-2xl font-bold text-center mb-6",
              css`
                color: red;
              `
            )}
          >
            Create Account
          </h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};
