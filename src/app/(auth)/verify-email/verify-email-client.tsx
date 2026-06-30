"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/features/auth/auth.actions";

type State = "verifying" | "success" | "error";

export function VerifyEmailClient({
  uid,
  token,
}: {
  uid: string;
  token: string;
}) {
  const [state, setState] = React.useState<State>("verifying");
  const [message, setMessage] = React.useState("");
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const res = await verifyEmailAction(uid, token);
      if (res.ok) {
        setState("success");
      } else {
        setState("error");
        setMessage(res.error ?? "Verification failed.");
      }
    })();
  }, [uid, token]);

  if (state === "verifying") {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-gold" />
        <p className="mt-4 text-sm text-muted-foreground">
          Verifying your email…
        </p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-10 text-gold" />
        <h1 className="mt-4 font-serif text-2xl">Email verified</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account is now active. You can sign in.
        </p>
        <Button asChild variant="gold" size="lg" className="mt-6 w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <XCircle className="mx-auto size-10 text-destructive" />
      <h1 className="mt-4 font-serif text-2xl">Verification failed</h1>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Ask an administrator to resend your verification email, then try the new
        link.
      </p>
      <Button asChild variant="outline" size="lg" className="mt-6 w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
