"use client";

import { AdminForm, FormField, type FormAction } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export function CategoryForm({
  action,
  initial,
}: {
  action: FormAction;
  initial?: CategoryFormValues;
}) {
  return (
    <AdminForm action={action} redirectTo="/admin/categories" submitLabel="Save Category">
      <FormField label="Name">
        <Input name="name" defaultValue={initial?.name} required />
      </FormField>
      <FormField label="Slug (optional)">
        <Input name="slug" defaultValue={initial?.slug} placeholder="auto" />
      </FormField>
      <FormField label="Image URL">
        <Input
          name="image"
          defaultValue={initial?.image}
          placeholder="/images/product assets/skincare.webp"
        />
      </FormField>
      <FormField label="Sort order">
        <Input name="sortOrder" type="number" defaultValue={initial?.sortOrder ?? 0} />
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
