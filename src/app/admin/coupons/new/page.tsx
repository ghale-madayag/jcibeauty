import { CouponForm } from "@/components/admin/coupon-form";
import { createCouponAction } from "@/features/coupons/coupon.actions";

export default function NewCouponPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl">New Coupon</h1>
      <div className="mt-8">
        <CouponForm action={createCouponAction} />
      </div>
    </div>
  );
}
