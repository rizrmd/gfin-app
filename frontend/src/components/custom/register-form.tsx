import { EForm } from "@/components/ext/eform/EForm";
import { Button } from "@/components/ui/button";
import { useLocal } from "@/lib/hooks/use-local";
import { navigate } from "@/lib/router";
import { Wand2 } from "lucide-react";
import { usBizUrl } from "shared/lib/biz_url";

export const RegisterForm = () => {
  const local = useLocal({
    loading: false,
    firstName: "",
    lastName: "",
    workEmail: "",
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
      }}
      className="space-y-4"
    >
      {({ Field, read, submit, write }) => {
        return (
          <>
            <Field
              name="firstName"
              disabled={read.loading}
              label="First Name"
            />
            <Field name="lastName" disabled={read.loading} label="Last Name" />
            <Field
              name="workEmail"
              disabled={read.loading}
              label="Work Email"
              input={{ type: "email" }}
            />
            {/* <Field
              name="password"
              disabled={read.loading}
              label="Password"
              input={{ type: "password" }}
            /> */}
            <Field
              name="orgName"
              disabled={read.loading}
              label="Organization Name"
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
            />
            <div className="flex gap-2">
              <Button
                variant={"secondary"}
                onClick={(e) => {
                  const fill = {
                    firstName: "Damu",
                    lastName: "Winston",
                    workEmail: "damu@deeplearningintelligence.com",
                    orgName: "Deep Learning Intelligence",
                    state: "Florida",
                  };
                  for (const [k, v] of Object.entries(fill)) {
                    write[k] = v;
                  }
                  e.preventDefault();
                }}
              >
                <Wand2 />
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={read.loading}
                onClick={submit}
              >
                {read.loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </>
        );
      }}
    </EForm>
  );
};
