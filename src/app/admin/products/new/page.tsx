import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { createProductAction } from "@/features/products/product.actions";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">New Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Add a new product to your catalog.
      </p>
      <div className="mt-8">
        <ProductForm action={createProductAction} categories={categories} />
      </div>
    </div>
  );
}
