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
import { deleteProductAction } from "@/features/products/product.actions";

export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, setPending] = React.useState(false);

  async function onDelete() {
    setPending(true);
    const res = await deleteProductAction(id);
    setPending(false);
    if (res.ok) toast.success("Product deleted");
    else toast.error("Could not delete");
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete “{name}”? This cannot be undone.
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
