import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteCategoryAction } from "@/features/categories/category.actions";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} categories
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/categories/new">
            <Plus className="size-4" /> New Category
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c._count.products}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "gold" : "secondary"}>
                    {c.isActive ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/categories/${c.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteCategoryAction.bind(null, c.id)}
                      name={c.name}
                      entity="Category"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
