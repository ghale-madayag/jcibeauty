"use client";

import { AdminForm, FormField, type FormAction } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";

export interface UserFormValues {
  name: string;
  email: string;
  role: "ADMIN" | "SHOP_MANAGER";
}

export function UserForm({
  action,
  initial,
  isEdit = false,
}: {
  action: FormAction;
  initial?: UserFormValues;
  isEdit?: boolean;
}) {
  return (
    <AdminForm
      action={action}
      redirectTo="/admin/users"
      submitLabel={isEdit ? "Save User" : "Create User"}
    >
      <FormField label="Name">
        <Input name="name" defaultValue={initial?.name} placeholder="Jane Cruz" required />
      </FormField>
      <FormField label="Email">
        <Input
          name="email"
          type="email"
          defaultValue={initial?.email}
          placeholder="jane@jcibeauty.com"
          required
        />
      </FormField>
      <FormField label="Role">
        <select
          name="role"
          defaultValue={initial?.role ?? "SHOP_MANAGER"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="SHOP_MANAGER">Shop Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </FormField>
      <FormField label={isEdit ? "New password" : "Password"}>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          required={!isEdit}
          placeholder={isEdit ? "Leave blank to keep current" : "At least 8 characters"}
        />
      </FormField>
    </AdminForm>
  );
}
