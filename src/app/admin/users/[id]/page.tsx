import { notFound } from "next/navigation";
import { UserForm } from "@/components/admin/user-form";
import { userAdminService } from "@/features/users/user.admin";
import { updateUserAction } from "@/features/users/user.actions";
import { ASSIGNABLE_ROLES } from "@/lib/permissions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await userAdminService.getForEdit(id);
  if (!user) notFound();

  // Only Admin / Shop Manager accounts are managed here.
  const role = (ASSIGNABLE_ROLES as readonly string[]).includes(user.role)
    ? (user.role as "ADMIN" | "SHOP_MANAGER")
    : "SHOP_MANAGER";

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit User</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      <div className="mt-8">
        <UserForm
          action={updateUserAction.bind(null, id)}
          initial={{ name: user.name, email: user.email, role }}
          isEdit
        />
      </div>
    </div>
  );
}
