import { EForm } from "@/components/ext/eform/EForm";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { navigate } from "@/lib/router";

export const LoginForm = () => {
  const local = useLocal({
    loading: false,
    email: "",
    password: "",
  });

  return (
    <EForm
      data={local}
      onSubmit={async ({ write, read }) => {
        write.loading = true;
        try {
          // await api.login();
          navigate("/");
        } catch (error) {
          Alert.info("Login failed:", error);
        } finally {
          write.loading = false;
        }
      }}
    className={cn("space-y-4", css `
      .field-label { display: none;}`)}
    >
      {({ Field, read, submit }) => {
        return (
          <>
            <Field
              name="email"
              disabled={read.loading}
              input={{ 
                type: "email", 
                placeholder: "Email" 
              }}
              label=""
            />
            <Field
              name="password"
              disabled={read.loading}
              input={{ 
                type: "password", 
                placeholder: "Password" 
              }}
              label=""
            />
            <Button
              type="submit"
              className="w-full"
              disabled={read.loading}
              onClick={submit}
            >
              {read.loading ? "Logging in..." : "Sign In"}
            </Button>
          </>
        );
      }}
    </EForm>
  );
};
