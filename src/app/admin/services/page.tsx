import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ImageIcon } from "lucide-react";
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
import { formatMoney } from "@/lib/money";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteServiceAction } from "@/features/services/service.actions";

export default async function AdminServicesPage() {
  const services = await db.service.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { staff: true, appointments: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length} treatments
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/services/new">
            <Plus className="size-4" /> New Service
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Specialists</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="relative size-12 overflow-hidden rounded-md border bg-secondary">
                    {s.image ? (
                      <Image
                        src={s.image}
                        alt={s.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-5" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.durationMin} min</TableCell>
                <TableCell>{formatMoney(s.price.toString())}</TableCell>
                <TableCell>{s._count.staff}</TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "gold" : "secondary"}>
                    {s.isActive ? "Active" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/services/${s.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteServiceAction.bind(null, s.id)}
                      name={s.name}
                      entity="Service"
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
