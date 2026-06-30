import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { TreatmentService } from "@/features/services/service.service";

export function ServicesSection({
  services,
}: {
  services: TreatmentService[];
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => (
        <div
          key={s.id}
          className="group overflow-hidden rounded-xl border bg-card"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            {s.image && (
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex flex-col gap-2 p-5">
            <h3 className="font-serif text-lg leading-snug">{s.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {s.description}
            </p>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {s.durationMin} min
              </span>
              <span className="font-medium text-foreground">
                {formatMoney(s.price)}
              </span>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href={`/book?service=${s.slug}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
