import { ServiceForm } from "@/components/admin/service-form";
import { createServiceAction } from "@/features/services/service.actions";

export default function NewServicePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">New Service</h1>
      <div className="mt-8">
        <ServiceForm action={createServiceAction} />
      </div>
    </div>
  );
}
