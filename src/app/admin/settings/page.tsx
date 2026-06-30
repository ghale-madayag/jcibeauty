import { db } from "@/lib/db";
import { minutesToTime } from "@/lib/slots";
import {
  StoreSettingsForm,
  BusinessHoursForm,
} from "@/components/admin/settings-forms";
import {
  updateStoreSettingsAction,
  updateBusinessHoursAction,
} from "@/features/settings/settings.actions";

export default async function AdminSettingsPage() {
  const [setting, hours] = await Promise.all([
    db.setting.findUnique({ where: { key: "store" } }),
    db.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
  ]);

  const raw = (setting?.value ?? {}) as Record<string, unknown>;
  const store = {
    name: String(raw.name ?? "JCI Beauty"),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    freeShippingThreshold: Number(raw.freeShippingThreshold ?? 0),
  };

  const hoursMap: Record<
    number,
    { open: string; close: string; isClosed: boolean }
  > = {};
  for (const h of hours) {
    hoursMap[h.dayOfWeek] = {
      open: minutesToTime(h.openMin),
      close: minutesToTime(h.closeMin),
      isClosed: h.isClosed,
    };
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Store configuration and business hours.
      </p>

      <section className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="mb-5 font-serif text-lg">Store Details</h2>
        <StoreSettingsForm action={updateStoreSettingsAction} store={store} />
      </section>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="mb-5 font-serif text-lg">Business Hours</h2>
        <BusinessHoursForm action={updateBusinessHoursAction} hours={hoursMap} />
      </section>
    </div>
  );
}
