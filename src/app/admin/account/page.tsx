import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ProfileForm, PasswordForm } from "@/components/admin/account-forms";
import {
  updateProfileAction,
  changePasswordAction,
} from "@/features/account/account.actions";
import { ROLE_LABELS } from "@/lib/permissions";

export default async function AdminAccountPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id } })
    : null;
  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl">My Account</h1>
        <Badge variant={user.role === "ADMIN" ? "gold" : "secondary"}>
          {ROLE_LABELS[user.role]}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your details and password.
      </p>

      <section className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="font-serif text-lg">Profile</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Changing your email takes effect after you sign out and back in.
        </p>
        <ProfileForm
          action={updateProfileAction}
          initial={{ name: user.name ?? "", email: user.email }}
        />
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="font-serif text-lg">Change password</h2>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Enter your current password to set a new one.
        </p>
        <PasswordForm action={changePasswordAction} />
      </section>
    </div>
  );
}
