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
import { ImageUploader } from "@/components/admin/image-uploader";

type ActionResult = { ok: boolean; error?: string } | undefined;
type FormAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

export interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  categoryId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
}

export function ProductForm({
  action,
  categories,
  initial,
}: {
  action: FormAction;
  categories: { id: string; name: string }[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Product saved");
      router.push("/admin/products");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="grid gap-5 rounded-xl border bg-card p-6 sm:grid-cols-2">
        <Field label="Name" className="sm:col-span-2">
          <Input name="name" defaultValue={initial?.name} required />
        </Field>
        <Field label="Slug (optional)">
          <Input name="slug" defaultValue={initial?.slug} placeholder="auto" />
        </Field>
        <Field label="SKU">
          <Input name="sku" defaultValue={initial?.sku ?? ""} />
        </Field>
        <Field label="Price">
          <Input
            name="price"
            type="number"
            step="0.01"
            defaultValue={initial?.price}
            required
          />
        </Field>
        <Field label="Compare-at price">
          <Input
            name="compareAtPrice"
            type="number"
            step="0.01"
            defaultValue={initial?.compareAtPrice ?? ""}
          />
        </Field>
        <Field label="Stock">
          <Input
            name="stock"
            type="number"
            defaultValue={initial?.stock ?? 0}
          />
        </Field>
        <Field label="Category">
          <select
            name="categoryId"
            defaultValue={initial?.categoryId ?? ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Short description" className="sm:col-span-2">
          <Textarea name="shortDesc" defaultValue={initial?.shortDesc} />
        </Field>
        <Field label="Full description" className="sm:col-span-2">
          <Textarea
            name="description"
            defaultValue={initial?.description}
            className="min-h-32"
          />
        </Field>
        <Field label="Product images" className="sm:col-span-2">
          <ImageUploader initial={initial?.images} />
          <p className="mt-2 text-xs text-muted-foreground">
            The first image is the primary thumbnail. Add several to build the
            product gallery shown on the product page.
          </p>
        </Field>

        <div className="flex gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial?.isActive ?? true}
              className="size-4"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={initial?.isFeatured ?? false}
              className="size-4"
            />
            Featured
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save Product
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
