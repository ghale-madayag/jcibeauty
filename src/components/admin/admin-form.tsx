"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type ActionResult = { ok: boolean; error?: string } | undefined;
export type FormAction = (
  prev: ActionResult,
  formData: FormData,
) => Promise<ActionResult>;

/** Shared admin form shell: handles useActionState, toasts, and redirect. */
export function AdminForm({
  action,
  redirectTo,
  submitLabel = "Save",
  children,
}: {
  action: FormAction;
  redirectTo: string;
  submitLabel?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Saved");
      router.push(redirectTo);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, redirectTo]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="grid gap-5 rounded-xl border bg-card p-6 sm:grid-cols-2">
        {children}
      </div>
      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function FormField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
