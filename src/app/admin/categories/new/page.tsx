import { CategoryForm } from "@/components/admin/category-form";
import { createCategoryAction } from "@/features/categories/category.actions";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">New Category</h1>
      <div className="mt-8">
        <CategoryForm action={createCategoryAction} />
      </div>
    </div>
  );
}
