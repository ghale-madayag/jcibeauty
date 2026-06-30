"use client";

import * as React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Generic delete confirmation. `action` is a bound server action, e.g.
 * `deleteCategoryAction.bind(null, id)`.
 */
export function ConfirmDeleteButton({
  action,
  name,
  entity = "item",
}: {
  action: () => Promise<{ ok: boolean; error?: string }>;
  name: string;
  entity?: string;
}) {
  const [pending, setPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function onDelete() {
    setPending(true);
    const res = await action();
    setPending(false);
    if (res.ok) {
      toast.success(`${entity} deleted`);
      setOpen(false);
    } else {
      toast.error(res.error ?? "Could not delete");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {entity}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete “{name}”? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onDelete} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
