import { db } from "@/lib/db";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true, appointments: true } },
    },
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {customers.length} customers
      </p>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell>{c._count.orders}</TableCell>
                <TableCell>{c._count.appointments}</TableCell>
                <TableCell className="text-muted-foreground">
                  {c.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
