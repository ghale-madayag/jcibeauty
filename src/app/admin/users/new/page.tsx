import { UserForm } from "@/components/admin/user-form";
import { createUserAction } from "@/features/users/user.actions";

export default function NewUserPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">New User</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a panel account and assign its role.
      </p>
      <div className="mt-8">
        <UserForm action={createUserAction} />
      </div>
    </div>
  );
}
