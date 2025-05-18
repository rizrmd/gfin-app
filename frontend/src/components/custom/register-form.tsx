import { EForm } from "@/components/ext/eform/EForm";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { navigate } from "@/lib/router";
import { usBizUrl } from "shared/lib/biz_url";
export const RegisterForm = () => {
  const local = useLocal({
    loading: false,
    firstName: "",
    lastName: "",
    workEmail: "",
    password: "",
    orgName: "",
    state: "",
  });

  if (localStorage.getItem("client_id") !== null) {
    navigate("/onboard/welcome");
    return <></>;
  }

  return (
    <EForm
      data={local}
      onSubmit={async ({ write, read }) => {
        write.loading = true;
        try {
          const res = await api.register(read);
          if (res.error) {
            await Alert.info(res.error);
            return;
          }
          if (res.id) {
            localStorage.setItem("client_id", res.id);
          }
          navigate("/onboard/welcome");
        } catch (error) {
          Alert.info("Registration failed:", error);
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
              name="firstName"
              disabled={read.loading}
              label=""
              input={{ 
                type: "text",
                placeholder: "First Name" 
              }}
            />
            <Field 
              name="lastName" 
              disabled={read.loading} 
              label=""
              input={{ 
                type: "text",
                placeholder: "Last Name" 
              }} 
            />
            <Field
              name="workEmail"
              disabled={read.loading}
              label=""
              input={{ type: "email", placeholder: "Work Email" }}
            />
            <Field
              name="password"
              disabled={read.loading}
              label=""
              input={{ type: "password", placeholder: "Password" }}
            />
            <Field 
              name="orgName" 
              disabled={read.loading} 
              label="Org Name"
              input={{ 
                placeholder: "Organization Name" 
              }} 
            />
            <Field
              name="state"
              disabled={read.loading}
              dropdown={{
                options: usBizUrl.map((s) => {
                  return { label: `${s.abbr} - ${s.state}`, value: s.state };
                }),
              }}
              label="State"
              input={{ placeholder: "State" }}  
            />
            <Button
              type="submit"
              className="w-full"
              disabled={read.loading}
              onClick={submit}
            >
              {read.loading ? "Creating Account..." : "Create Account"}
            </Button>
          </>
        );
      }}
    </EForm>
  );
};
