import { notFound } from "next/navigation";
import { CouponForm } from "@/components/admin/coupon-form";
import { couponAdminService } from "@/features/coupons/coupon.admin";
import { updateCouponAction } from "@/features/coupons/coupon.actions";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await couponAdminService.getForEdit(id);
  if (!coupon) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl">Edit Coupon</h1>
      <p className="mt-1 font-mono text-sm text-muted-foreground">{coupon.code}</p>
      <div className="mt-8">
        <CouponForm action={updateCouponAction.bind(null, id)} initial={coupon} />
      </div>
    </div>
  );
}
