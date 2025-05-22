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
import { Form } from "@/components/ext/eform/form";
import { useLocal } from "@/lib/hooks/use-local";
import type { FC } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface OtpInputProps {
  email: string;
  isOpen: boolean;
  onSubmit: (otp: string) => void;
  onCancel: () => void;
  onResend: () => void;
  loading?: boolean;
}

export const OtpInput: FC<OtpInputProps> = ({
  email,
  isOpen,
  onSubmit,
  onCancel,
  onResend,
  loading: externalLoading,
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

        <Form
          data={local}
          onSubmit={async ({ write, read }) => {
            write.loading = true;
            onSubmit(read.otp);
          }}
          className="space-y-4 py-4 flex items-center justify-center"
        >
          {({ Field, read, write, submit }) => (
            <>
              <InputOTP
                maxLength={6}
                value={read.otp}
                className="flex items-center justify-center gap-2"
                onChange={(value) => {
                  write.otp = value;
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={onResend}
                  disabled={read.loading || externalLoading}
                  type="button"
                >
                  {externalLoading ? "Sending..." : "Resend Code"}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    read.loading || externalLoading || !read.otp?.length
                  }
                  onClick={submit}
                >
                  {read.loading ? "Verifying..." : "Verify"}
                </Button>
              </DialogFooter>
            </>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
};
