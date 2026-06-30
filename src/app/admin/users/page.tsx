import Link from "next/link";
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
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ResendVerificationButton } from "@/components/admin/resend-verification-button";
import { userAdminService } from "@/features/users/user.admin";
import { deleteUserAction } from "@/features/users/user.actions";
import { ROLE_LABELS } from "@/lib/permissions";

export default async function AdminUsersPage() {
  const users = await userAdminService.list();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} panel {users.length === 1 ? "account" : "accounts"}
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/users/new">
            <Plus className="size-4" /> New User
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === "ADMIN" ? "gold" : "secondary"}>
                    {ROLE_LABELS[u.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.emailVerified ? (
                    <Badge variant="secondary">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {u.createdAt.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {!u.emailVerified && (
                      <ResendVerificationButton userId={u.id} />
                    )}
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/users/${u.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteUserAction.bind(null, u.id)}
                      name={u.name ?? u.email}
                      entity="User"
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
