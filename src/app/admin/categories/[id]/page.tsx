import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { categoryAdminService } from "@/features/categories/category.admin";
import { updateCategoryAction } from "@/features/categories/category.actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await categoryAdminService.getForEdit(id);
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit Category</h1>
      <p className="mt-1 text-sm text-muted-foreground">{category.name}</p>
      <div className="mt-8">
        <CategoryForm
          action={updateCategoryAction.bind(null, id)}
          initial={category}
        />
      </div>
    </div>
  );
}
