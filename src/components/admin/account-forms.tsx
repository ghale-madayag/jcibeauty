"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormAction } from "@/components/admin/admin-form";

export function ProfileForm({
  action,
  initial,
}: {
  action: FormAction;
  initial: { name: string; email: string };
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Profile updated");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block">Name</Label>
          <Input name="name" defaultValue={initial.name} required />
        </div>
        <div>
          <Label className="mb-1.5 block">Email</Label>
          <Input name="email" type="email" defaultValue={initial.email} required />
        </div>
      </div>
      <Button type="submit" variant="gold" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}

export function PasswordForm({ action }: { action: FormAction }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Password updated");
      formRef.current?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Current password</Label>
          <Input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <Label className="mb-1.5 block">New password</Label>
          <Input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Confirm new password</Label>
          <Input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
      </div>
      <Button type="submit" variant="gold" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Update password
      </Button>
    </form>
  );
}
