import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";
import { productAdminService } from "@/features/products/product.admin";
import { updateProductAction } from "@/features/products/product.actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productAdminService.getForEdit(id),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit Product</h1>
      <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      <div className="mt-8">
        <ProductForm
          action={updateProductAction.bind(null, id)}
          categories={categories}
          initial={product}
        />
      </div>
    </div>
  );
}
