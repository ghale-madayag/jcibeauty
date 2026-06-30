"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DAYS_OF_WEEK } from "@/lib/constants";
import type { FormAction } from "@/components/admin/admin-form";

function useSavedToast(state: { ok: boolean; error?: string } | undefined) {
  const router = useRouter();
  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);
}

export function StoreSettingsForm({
  action,
  store,
}: {
  action: FormAction;
  store: { name: string; email: string; phone: string; freeShippingThreshold: number };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  useSavedToast(state);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block">Store name</Label>
          <Input name="name" defaultValue={store.name} />
        </div>
        <div>
          <Label className="mb-1.5 block">Email</Label>
          <Input name="email" type="email" defaultValue={store.email} />
        </div>
        <div>
          <Label className="mb-1.5 block">Phone</Label>
          <Input name="phone" defaultValue={store.phone} />
        </div>
        <div>
          <Label className="mb-1.5 block">Free shipping threshold</Label>
          <Input
            name="freeShippingThreshold"
            type="number"
            defaultValue={store.freeShippingThreshold}
          />
        </div>
      </div>
      <Button type="submit" variant="gold" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save Store Details
      </Button>
    </form>
  );
}

export function BusinessHoursForm({
  action,
  hours,
}: {
  action: FormAction;
  hours: Record<number, { open: string; close: string; isClosed: boolean }>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  useSavedToast(state);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day, d) => {
          const h = hours[d];
          return (
            <div key={d} className="flex flex-wrap items-center gap-3">
              <span className="w-28 text-sm font-medium">{day}</span>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name={`closed_${d}`}
                  defaultChecked={h?.isClosed ?? false}
                  className="size-4"
                />
                Closed
              </label>
              <Input
                type="time"
                name={`open_${d}`}
                defaultValue={h?.open ?? "08:00"}
                className="w-32"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="time"
                name={`close_${d}`}
                defaultValue={h?.close ?? "17:00"}
                className="w-32"
              />
            </div>
          );
        })}
      </div>
      <Button type="submit" variant="gold" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save Business Hours
      </Button>
    </form>
  );
}
