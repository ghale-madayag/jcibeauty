"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DAYS_OF_WEEK } from "@/lib/constants";
import type { FormAction } from "@/components/admin/admin-form";

export interface StaffFormValues {
  name: string;
  title: string;
  bio: string;
  image: string;
  email: string;
  phone: string;
  sortOrder: number;
  isActive: boolean;
  serviceIds: string[];
  schedule: Record<number, { start: string; end: string }>;
}

export function StaffForm({
  action,
  services,
  initial,
}: {
  action: FormAction;
  services: { id: string; name: string }[];
  initial?: StaffFormValues;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Staff saved");
      router.push("/admin/staff");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="grid gap-5 rounded-xl border bg-card p-6 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" defaultValue={initial?.name} required />
        </Field>
        <Field label="Title">
          <Input name="title" defaultValue={initial?.title} placeholder="Senior Esthetician" />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" defaultValue={initial?.email} />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={initial?.phone} />
        </Field>
        <Field label="Image URL">
          <Input name="image" defaultValue={initial?.image} placeholder="/images/dr.webp" />
        </Field>
        <Field label="Sort order">
          <Input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
        </Field>
        <Field label="Bio" className="sm:col-span-2">
          <Textarea name="bio" defaultValue={initial?.bio} />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={initial?.isActive ?? true}
            className="size-4"
          />
          Active
        </label>
      </div>

      {/* Services */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-serif text-lg">Services offered</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="serviceIds"
                value={s.id}
                defaultChecked={initial?.serviceIds.includes(s.id)}
                className="size-4"
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-serif text-lg">Weekly schedule</h2>
        <div className="mt-4 space-y-2">
          {DAYS_OF_WEEK.map((day, d) => {
            const existing = initial?.schedule[d];
            return (
              <div key={d} className="flex items-center gap-3">
                <label className="flex w-32 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name={`day_${d}`}
                    defaultChecked={!!existing}
                    className="size-4"
                  />
                  {day}
                </label>
                <Input
                  type="time"
                  name={`start_${d}`}
                  defaultValue={existing?.start ?? "09:00"}
                  className="w-32"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="time"
                  name={`end_${d}`}
                  defaultValue={existing?.end ?? "17:00"}
                  className="w-32"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save Staff
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
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
