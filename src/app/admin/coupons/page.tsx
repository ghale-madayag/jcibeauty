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
import { formatMoney } from "@/lib/money";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { deleteCouponAction } from "@/features/coupons/coupon.actions";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {coupons.length} coupons
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/coupons/new">
            <Plus className="size-4" /> New Coupon
          </Link>
        </Button>
      </div>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min. Spend</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.code}</TableCell>
                <TableCell>
                  {c.type === "PERCENT"
                    ? `${c.value.toString()}%`
                    : formatMoney(c.value.toString())}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.minSubtotal ? formatMoney(c.minSubtotal.toString()) : "—"}
                </TableCell>
                <TableCell>{c.timesRedeemed}</TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "gold" : "secondary"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/admin/coupons/${c.id}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <ConfirmDeleteButton
                      action={deleteCouponAction.bind(null, c.id)}
                      name={c.code}
                      entity="Coupon"
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
