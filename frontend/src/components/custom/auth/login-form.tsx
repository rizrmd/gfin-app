import { EForm } from "@/components/ext/eform/EForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { css } from "goober";
import type { FC } from "react";

const emptyForm = {
  loading: false,
  email: "",
};

export const LoginForm: FC<{
  onSubmit: (form: typeof emptyForm) => void;
  onInit: (form: typeof emptyForm) => void;
  form: typeof emptyForm;
}> = ({ onSubmit, form, onInit }) => {
  return (
    <EForm
      data={form}
      onInit={({ write }) => {
        onInit(write);
      }}
      onSubmit={async ({ write, read }) => {
        onSubmit(write);
      }}
      className={cn(
        "space-y-4",
        css`
          .field-label {
            display: none;
          }
        `
      )}
    >
      {({ Field, read, submit }) => {
        return (
          <>
            <Field
              name="email"
              disabled={read.loading}
              input={{
                type: "email",
                placeholder: "Email",
              }}
              label=""
            />
            <Button
              type="submit"
              className="w-full"
              disabled={read.loading}
              onClick={submit}
            >
              {read.loading ? "Sending verification code..." : "Sign In"}
            </Button>
          </>
        );
      }}
    </EForm>
  );
};
