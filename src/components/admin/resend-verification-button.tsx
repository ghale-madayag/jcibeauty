"use client";

import * as React from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resendUserVerificationAction } from "@/features/users/user.actions";

export function ResendVerificationButton({ userId }: { userId: string }) {
  const [pending, setPending] = React.useState(false);

  async function onResend() {
    setPending(true);
    const res = await resendUserVerificationAction(userId);
    setPending(false);
    if (res.ok) toast.success("Verification email sent");
    else toast.error(res.error ?? "Could not send email");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onResend}
      disabled={pending}
      aria-label="Resend verification email"
      title="Resend verification email"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MailCheck className="size-4" />
      )}
    </Button>
  );
}
