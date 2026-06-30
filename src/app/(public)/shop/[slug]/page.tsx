import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Star, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductPurchase } from "@/components/shop/product-purchase";
import { ProductGrid } from "@/components/shop/product-grid";
import { SectionHeading } from "@/components/home/section-heading";
import { formatMoney } from "@/lib/money";
import { productService } from "@/features/products/product.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) notFound();

  const related = (
    await productService.list({
      category: product.categorySlug ?? undefined,
      sort: "popular",
      page: 1,
    })
  ).items
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const onSale =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <div className="container-px mx-auto max-w-7xl py-10">
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        {product.categoryName && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/shop?category=${product.categorySlug}`}
              className="hover:text-foreground"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.categoryName && (
            <span className="text-xs font-medium uppercase tracking-luxe text-gold">
              {product.categoryName}
            </span>
          )}
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-gold">
              <Star className="size-4 fill-gold" />
              {product.ratingAvg.toFixed(1)}
            </span>
            <span>({product.ratingCount} reviews)</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-medium">
              {formatMoney(product.price)}
            </span>
            {onSale && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatMoney(product.compareAtPrice)}
                </span>
                <Badge variant="gold">Sale</Badge>
              </>
            )}
          </div>

          {product.shortDesc && (
            <p className="mt-5 text-muted-foreground">{product.shortDesc}</p>
          )}

          <Separator className="my-7" />

          <ProductPurchase product={product} />

          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Truck className="size-5 text-gold" /> Free shipping ₱1,999+
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="size-5 text-gold" /> Dermatologist tested
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="size-5 text-gold" /> Cruelty-free
            </div>
          </div>

          {product.description && (
            <div className="mt-10">
              <h3 className="font-serif text-lg">Description</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="You May Also Like" title="Related Products" />
          <div className="mt-12">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
