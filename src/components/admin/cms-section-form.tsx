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

export function CmsSectionForm({
  action,
  title,
  isActive,
  content,
}: {
  action: FormAction;
  title: string;
  isActive: boolean;
  content: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, undefined);

  React.useEffect(() => {
    if (state?.ok) {
      toast.success("Section updated");
      router.push("/admin/cms");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="space-y-5 rounded-xl border bg-card p-6">
        <div>
          <Label className="mb-1.5 block">Title</Label>
          <Input name="title" defaultValue={title} />
        </div>
        <div>
          <Label className="mb-1.5 block">Content (JSON)</Label>
          <Textarea
            name="content"
            defaultValue={content}
            className="min-h-80 font-mono text-xs"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Edit the structured content for this homepage block. Must be valid
            JSON.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={isActive}
            className="size-4"
          />
          Active (visible on homepage)
        </label>
      </div>
      <div className="flex gap-3">
        <Button type="submit" variant="gold" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save Section
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
