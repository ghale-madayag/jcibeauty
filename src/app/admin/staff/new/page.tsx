import { db } from "@/lib/db";
import { StaffForm } from "@/components/admin/staff-form";
import { createStaffAction } from "@/features/staff/staff.actions";

export default async function NewStaffPage() {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">New Staff Member</h1>
      <div className="mt-8">
        <StaffForm action={createStaffAction} services={services} />
      </div>
    </div>
  );
}
