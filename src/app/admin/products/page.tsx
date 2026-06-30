import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
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
import { formatMoney } from "@/lib/money";
import { productAdminService } from "@/features/products/product.admin";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function AdminProductsPage() {
  const products = await productAdminService.listAll();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} products
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/products/new">
            <Plus className="size-4" /> New Product
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-secondary">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.categoryName ?? "—"}
                </TableCell>
                <TableCell>{formatMoney(p.price)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Badge variant={p.isActive ? "gold" : "secondary"}>
                      {p.isActive ? "Active" : "Hidden"}
                    </Badge>
                    {p.isFeatured && <Badge variant="outline">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/products/${p.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <DeleteProductButton id={p.id} name={p.name} />
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
