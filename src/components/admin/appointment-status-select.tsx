"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { updateAppointmentStatusAction } from "@/features/appointments/appointment.admin.actions";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export function AppointmentStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [value, setValue] = React.useState(status);
  const [pending, setPending] = React.useState(false);

  async function onChange(next: string) {
    const prev = value;
    setValue(next);
    setPending(true);
    const res = await updateAppointmentStatusAction(id, next);
    setPending(false);
    if (res.ok) toast.success("Status updated");
    else {
      setValue(prev);
      toast.error(res.error ?? "Update failed");
    }
  }

  return (
    // Stop propagation so using the dropdown inside a clickable row doesn't
    // also navigate to the appointment detail page.
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Select value={value} onValueChange={onChange} disabled={pending}>
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
