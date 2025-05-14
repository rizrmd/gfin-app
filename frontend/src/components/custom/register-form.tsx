import { EForm } from "@/components/ext/eform/EForm";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/global-alert";
import { api } from "@/lib/gen/api";
import { useLocal } from "@/lib/hooks/use-local";
import { navigate } from "@/lib/router";
import { usStates } from "shared/lib/us_states";

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
  return <EForm
    data={local}
    onSubmit={async ({ write, read }) => {
      write.loading = true;
      alert("Hello world");
      try {
        await api.register(read);
        navigate("/");
      } catch (error) {
        Alert.info("Registration failed:", error);
      } finally {
        write.loading = false;
      }
    }}
    className="space-y-4"
  >
    {({ Field, read, submit }) => {
      return (
        <>
          <Field name="firstName" disabled={read.loading} label="First Name" />
          <Field name="lastName" disabled={read.loading} label="Last Name" />
          <Field
            name="workEmail"
            disabled={read.loading}
            label="Work Email"
            input={{ type: "email" }}
          />
          <Field
            name="password"
            disabled={read.loading}
            label="Password"
            input={{ type: "password" }}
          />
          <Field name="orgName" disabled={read.loading} label="Org Name" />
          <Field
            name="state"
            disabled={read.loading}
            dropdown={{
              options: usStates.map((s) => {
                const parts = s.split(" - ");
                return { label: s, value: parts[1] };
              }),
            }}
            label="State"
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
  </EForm>;
};
