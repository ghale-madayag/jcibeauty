"use client";

import { AdminForm, FormField, type FormAction } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";

export interface ServiceFormValues {
  name: string;
  slug: string;
  description: string;
  image: string;
  durationMin: number;
  bufferMin: number;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

export function ServiceForm({
  action,
  initial,
}: {
  action: FormAction;
  initial?: ServiceFormValues;
}) {
  return (
    <AdminForm action={action} redirectTo="/admin/services" submitLabel="Save Service">
      <FormField label="Name" className="sm:col-span-2">
        <Input name="name" defaultValue={initial?.name} required />
      </FormField>
      <FormField label="Slug (optional)">
        <Input name="slug" defaultValue={initial?.slug} placeholder="auto" />
      </FormField>
      <FormField label="Featured image" className="sm:col-span-2">
        <ImageUploader
          name="image"
          multiple={false}
          initial={initial?.image ? [initial.image] : []}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Shown on the services listing and the booking page. Upload a file or
          paste an existing image path.
        </p>
      </FormField>
      <FormField label="Duration (minutes)">
        <Input name="durationMin" type="number" defaultValue={initial?.durationMin ?? 60} required />
      </FormField>
      <FormField label="Buffer (minutes)">
        <Input name="bufferMin" type="number" defaultValue={initial?.bufferMin ?? 0} />
      </FormField>
      <FormField label="Price">
        <Input name="price" type="number" step="0.01" defaultValue={initial?.price} required />
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
