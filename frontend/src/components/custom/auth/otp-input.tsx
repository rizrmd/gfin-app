import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EForm } from "@/components/ext/eform/EForm";
import { useLocal } from "@/lib/hooks/use-local";
import type { FC } from "react";

interface OtpInputProps {
  email: string;
  isOpen: boolean;
  onSubmit: (otp: string) => void;
  onCancel: () => void;
  onResend: () => void;
}

export const OtpInput: FC<OtpInputProps> = ({
  email,
  isOpen,
  onSubmit,
  onCancel,
  onResend,
}) => {
  const local = useLocal({
    otp: "",
    loading: false,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter verification code</DialogTitle>
          <DialogDescription>
            We've sent a verification code to {email}. Please enter it below.
          </DialogDescription>
        </DialogHeader>

        <EForm
          data={local}
          onSubmit={async ({ write, read }) => {
            write.loading = true;
            onSubmit(read.otp);
          }}
          className="space-y-4 py-4"
        >
          {({ Field, read, submit }) => (
            <>
              <Field
                name="otp"
                disabled={read.loading}
                label="Verification Code"
                input={{
                  placeholder: "Enter code",
                  maxLength: 6,
                  className: "text-center text-lg tracking-widest",
                }}
              />

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={onResend}
                  disabled={read.loading}
                  type="button"
                >
                  Resend Code
                </Button>
                <Button
                  type="submit"
                  disabled={read.loading || !read.otp?.length}
                  onClick={submit}
                >
                  {read.loading ? "Verifying..." : "Verify"}
                </Button>
              </DialogFooter>
            </>
          )}
        </EForm>
      </DialogContent>
    </Dialog>
  );
};
