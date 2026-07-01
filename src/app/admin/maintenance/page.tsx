import { getSiteAvailability } from "@/features/site-availability/site-availability.service";
import { updateSiteAvailabilityAction } from "@/features/site-availability/site-availability.actions";
import { SiteAvailabilityForm } from "@/components/admin/site-availability-form";

export default async function AdminMaintenancePage() {
  const availability = await getSiteAvailability();

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl">Maintenance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Take the storefront offline for visitors while your team keeps full
        access. Signed-in panel users always see the live site.
      </p>

      <div className="mt-8">
        <SiteAvailabilityForm
          action={updateSiteAvailabilityAction}
          availability={availability}
        />
      </div>
    </div>
  );
}
