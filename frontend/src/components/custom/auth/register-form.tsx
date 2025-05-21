import { EForm } from "@/components/ext/eform/form";
import { Button } from "@/components/ui/button";
import { useLocal } from "@/lib/hooks/use-local";
import { Link } from "@/lib/router";
import type { FC } from "react";
import { usBizUrl } from "shared/lib/biz_url";

const emptyForm = {
  loading: false,
  firstName: "",
  lastName: "",
  workEmail: "",
  orgName: "",
  orgWebsite: "",
  state: "",
};

export const RegisterForm: FC<{
  onSubmit: (form: typeof emptyForm) => void;
}> = ({ onSubmit }) => {
  const local = useLocal(emptyForm);

  return (
    <EForm
      data={local}
      onSubmit={async ({ write, read }) => {
        write.loading = true;
        onSubmit(write);
      }}
      className="space-y-4"
    >
      {({ Field, read, submit }) => {
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
              type="email"
            />
            <Field
              name="orgName"
              disabled={read.loading}
              label="Company Name"
            />
            <Field
              name="orgWebsite"
              disabled={read.loading}
              label="Company Website"
            />
            {/* <Field
              name="state"
              disabled={read.loading}
              dropdown={{
                options: usBizUrl.map((s) => {
                  return { label: `${s.abbr} - ${s.state}`, value: s.state };
                }),
              }}
              label="State"
            /> */}
            <div className="text-sm mt-3">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline text-blue-500">
                Sign in Here
              </Link>
            </div>
            <div className="flex gap-2 my-3">
              {/* <Button
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
              </Button> */}
              <Button
                type="submit"
                className="flex-1"
                disabled={read.loading}
                onClick={submit}
              >
                {read.loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
            <div className=" text-slate-500 text-sm text-center ">
              By registering, you agree to our
              <br /> terms of service and privacy policy.
            </div>{" "}
          </>
        );
      }}
    </EForm>
  );
};
