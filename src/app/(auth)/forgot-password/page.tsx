"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/features/auth/auth.actions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"request" | "reset">("request");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    await requestPasswordResetAction(email);
    setPending(false);
    setStep("reset");
    toast.success("If an account exists for that email, a reset code was sent.");
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await resetPasswordAction(email, code, password, confirmPassword);
    setPending(false);
    if (res.ok) {
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    } else {
      setError(res.error ?? "Could not reset your password.");
    }
  }

  if (step === "reset") {
    return (
      <div>
        <h1 className="font-serif text-2xl">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code we emailed to <strong>{email}</strong> and choose
          a new password.
        </p>

        <form onSubmit={onReset} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="code" className="mb-1.5 block">
              Reset code
            </Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="mb-1.5 block">
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full"
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Reset password
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setError(null);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Forgot password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send a code to reset your password.
      </p>

      <form onSubmit={onRequest} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email" className="mb-1.5 block">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          Send reset code
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:text-foreground">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
