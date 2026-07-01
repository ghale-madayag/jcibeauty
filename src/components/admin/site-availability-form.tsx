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
import type { FormAction } from "@/components/admin/admin-form";
import type { SiteAvailability, SiteMode } from "@/features/site-availability/site-availability.schema";

export function SiteAvailabilityForm({
  action,
  availability,
}: {
  action: FormAction;
  availability: SiteAvailability;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const router = useRouter();

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <ModeCard
        name="maintenance"
        title="Maintenance mode"
        description="Shows a “we’ll be right back” page to visitors while you work on the site."
        note="If both modes are on, Maintenance takes precedence."
        mode={availability.maintenance}
      />
      <ModeCard
        name="comingSoon"
        title="Coming soon mode"
        description="Shows a teaser page to visitors before your public launch."
        mode={availability.comingSoon}
      />

      <Button type="submit" variant="gold" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}

function ModeCard({
  name,
  title,
  description,
  note,
  mode,
}: {
  name: "maintenance" | "comingSoon";
  title: string;
  description: string;
  note?: string;
  mode: SiteMode;
}) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name={`${name}_enabled`}
            defaultChecked={mode.enabled}
            className="size-4 accent-gold"
          />
          Enabled
        </label>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <Label className="mb-1.5 block">Heading</Label>
          <Input name={`${name}_heading`} defaultValue={mode.heading} maxLength={120} />
        </div>
        <div>
          <Label className="mb-1.5 block">Message</Label>
          <Textarea
            name={`${name}_message`}
            defaultValue={mode.message}
            rows={3}
            maxLength={600}
          />
        </div>
      </div>

      {note && <p className="mt-3 text-xs text-muted-foreground">{note}</p>}
    </section>
  );
}
