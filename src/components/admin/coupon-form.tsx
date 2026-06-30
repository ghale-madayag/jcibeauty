"use client";

import { AdminForm, FormField, type FormAction } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface CouponFormValues {
  code: string;
  description: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number | null;
  maxRedemptions: number | null;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export function CouponForm({
  action,
  initial,
}: {
  action: FormAction;
  initial?: CouponFormValues;
}) {
  return (
    <AdminForm action={action} redirectTo="/admin/coupons" submitLabel="Save Coupon">
      <FormField label="Code">
        <Input name="code" defaultValue={initial?.code} placeholder="WELCOME10" required />
      </FormField>
      <FormField label="Type">
        <select
          name="type"
          defaultValue={initial?.type ?? "PERCENT"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="PERCENT">Percentage (%)</option>
          <option value="FIXED">Fixed amount</option>
        </select>
      </FormField>
      <FormField label="Value">
        <Input name="value" type="number" step="0.01" defaultValue={initial?.value} required />
      </FormField>
      <FormField label="Minimum subtotal">
        <Input
          name="minSubtotal"
          type="number"
          step="0.01"
          defaultValue={initial?.minSubtotal ?? ""}
        />
      </FormField>
      <FormField label="Max redemptions">
        <Input
          name="maxRedemptions"
          type="number"
          defaultValue={initial?.maxRedemptions ?? ""}
        />
      </FormField>
      <FormField label="Starts at">
        <Input name="startsAt" type="datetime-local" defaultValue={initial?.startsAt} />
      </FormField>
      <FormField label="Expires at">
        <Input name="expiresAt" type="datetime-local" defaultValue={initial?.expiresAt} />
      </FormField>
      <FormField label="Description" className="sm:col-span-2">
        <Textarea name="description" defaultValue={initial?.description} />
      </FormField>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial?.isActive ?? true}
          className="size-4"
        />
        Active
      </label>
    </AdminForm>
  );
}
