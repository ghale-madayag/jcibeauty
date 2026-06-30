import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/admin/service-form";
import { serviceAdminService } from "@/features/services/service.admin";
import { updateServiceAction } from "@/features/services/service.actions";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await serviceAdminService.getForEdit(id);
  if (!service) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit Service</h1>
      <p className="mt-1 text-sm text-muted-foreground">{service.name}</p>
      <div className="mt-8">
        <ServiceForm
          action={updateServiceAction.bind(null, id)}
          initial={service}
        />
      </div>
    </div>
  );
}
