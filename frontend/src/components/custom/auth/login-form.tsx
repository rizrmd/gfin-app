import { EForm } from "@/components/ext/eform/EForm";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/global-alert";
import { useLocal } from "@/lib/hooks/use-local";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";
import { css } from "goober";
import type { FC } from "react";

const emptyForm = {
  loading: false,
  email: "",
  password: "",
};

export const LoginForm: FC<{ onSubmit: (form: typeof emptyForm) => void }> = ({
  onSubmit,
}) => {
  const local = useLocal(emptyForm, async () => {
    // async init if needed
  });

  return (
    <EForm
      data={local}
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
              {read.loading ? "Logging in..." : "Sign In"}
            </Button>
          </>
        );
      }}
    </EForm>
  );
};
