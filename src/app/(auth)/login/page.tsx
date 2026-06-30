"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestLoginOtpAction,
  resendVerificationAction,
} from "@/features/auth/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [unverified, setUnverified] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function finishSignIn(creds: Record<string, string>): Promise<boolean> {
    const res = await signIn("credentials", { ...creds, redirect: false });
    if (res?.ok) {
      router.push("/admin");
      router.refresh();
      return true;
    }
    return false;
  }

  async function onSubmitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setPending(true);
    const r = await requestLoginOtpAction(email, password);
    if (!r.ok) {
      setPending(false);
      if (r.status === "UNVERIFIED") setUnverified(true);
      setError(r.error ?? "Sign in failed.");
      return;
    }
    if (r.otpRequired === false) {
      const ok = await finishSignIn({ email, password });
      setPending(false);
      if (!ok) setError("Sign in failed.");
      return;
    }
    setPending(false);
    setStep("otp");
  }

  async function onSubmitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const ok = await finishSignIn({ email, otp });
    setPending(false);
    if (!ok) setError("That code is invalid or has expired.");
  }

  async function onResendCode() {
    setPending(true);
    const r = await requestLoginOtpAction(email, password);
    setPending(false);
    if (r.ok && r.otpRequired) toast.success("A new code has been sent.");
    else setError(r.error ?? "Could not resend the code.");
  }

  async function onResendVerification() {
    await resendVerificationAction(email);
    toast.success("If your account needs verification, a new email has been sent.");
  }

  if (step === "otp") {
    return (
      <div>
        <h1 className="font-serif text-2xl">Enter your code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We emailed a 6-digit code to <strong>{email}</strong>. It expires in 10
          minutes.
        </p>

        <form onSubmit={onSubmitOtp} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="otp" className="mb-1.5 block">
              Verification code
            </Label>
            <Input
              id="otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              required
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={pending || otp.length !== 6}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Verify & sign in
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onResendCode}
            disabled={pending}
            className="text-gold hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setOtp("");
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Staff access only. Customers can shop and check out without an account.
      </p>

      <form onSubmit={onSubmitCredentials} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-gold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {unverified && (
          <button
            type="button"
            onClick={onResendVerification}
            className="text-sm text-gold hover:underline"
          >
            Resend verification email
          </button>
        )}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Continue
        </Button>
      </form>

      {process.env.NODE_ENV !== "production" && (
        <p className="mt-6 rounded-md bg-secondary p-3 text-center text-xs text-muted-foreground">
          Demo admin: admin@jcibeauty.com / admin123
        </p>
      )}
    </div>
  );
}
