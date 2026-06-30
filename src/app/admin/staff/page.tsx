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
import { DAYS_OF_WEEK } from "@/lib/constants";
import { minutesToTime } from "@/lib/slots";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteStaffAction } from "@/features/staff/staff.actions";

export default async function AdminStaffPage() {
  const staff = await db.staff.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      schedules: { orderBy: { dayOfWeek: "asc" } },
      _count: { select: { services: true, appointments: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Staff & Schedules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff.length} staff members
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/staff/new">
            <Plus className="size-4" /> New Staff
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => {
              const days = s.schedules
                .map((sc) => DAYS_OF_WEEK[sc.dayOfWeek].slice(0, 3))
                .join(", ");
              const sample = s.schedules[0];
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {days || "—"}
                    {sample && (
                      <span className="block text-xs">
                        {minutesToTime(sample.startMin)}–
                        {minutesToTime(sample.endMin)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{s._count.services}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "gold" : "secondary"}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/staff/${s.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <ConfirmDeleteButton
                        action={deleteStaffAction.bind(null, s.id)}
                        name={s.name}
                        entity="Staff"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
