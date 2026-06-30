import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { StaffForm } from "@/components/admin/staff-form";
import { staffAdminService } from "@/features/staff/staff.admin";
import { updateStaffAction } from "@/features/staff/staff.actions";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [staff, services] = await Promise.all([
    staffAdminService.getForEdit(id),
    db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!staff) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit Staff Member</h1>
      <p className="mt-1 text-sm text-muted-foreground">{staff.name}</p>
      <div className="mt-8">
        <StaffForm
          action={updateStaffAction.bind(null, id)}
          services={services}
          initial={staff}
        />
      </div>
    </div>
  );
}
