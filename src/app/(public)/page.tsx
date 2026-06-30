import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { PromoBanners } from "@/components/home/promo-banners";
import { SectionHeading } from "@/components/home/section-heading";
import { CategoryGrid } from "@/components/home/category-grid";
import { ServicesSection } from "@/components/home/services-section";
import { VideoSection } from "@/components/home/video-section";
import { Testimonials } from "@/components/home/testimonials";
import { Newsletter } from "@/components/home/newsletter";
import { ProductGrid } from "@/components/shop/product-grid";
import { cmsService } from "@/features/cms/cms.service";
import { productService } from "@/features/products/product.service";
import { categoryService } from "@/features/categories/category.service";
import { treatmentService } from "@/features/services/service.service";

export default async function HomePage() {
  const [slides, featured, newest, categories, services] = await Promise.all([
    cmsService.hero(),
    productService.featured(4),
    productService.newest(8),
    categoryService.featured(3),
    treatmentService.list(),
  ]);

  return (
    <>
      <HeroCarousel slides={slides} />

      {/* Brand marquee */}
      <div className="mt-10">
        <BrandMarquee />
      </div>

      {/* Top Picks */}
      <section className="container-px mx-auto max-w-7xl py-20">
        <SectionHeading
          eyebrow="Top Picks"
          title="Featured Products"
          description="Hand-selected favorites loved by our community."
        />
        <div className="mt-12">
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Categories */}
      <section className="container-px mx-auto max-w-7xl py-12">
        <SectionHeading eyebrow="Curated For You" title="Best Categories" />
        <div className="mt-12">
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-px mx-auto max-w-7xl py-20">
        <div className="flex items-end justify-between">
          <SectionHeading
            align="left"
            eyebrow="Just Dropped"
            title="New Arrivals"
          />
          <Button asChild variant="link" className="hidden md:inline-flex">
            <Link href="/shop">View all →</Link>
          </Button>
        </div>
        <div className="mt-12">
          <ProductGrid products={newest} />
        </div>
      </section>

      {/* Services */}
      <section className="bg-secondary/40 py-20">
        <div className="container-px mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Professional Care"
            title="Clinical Treatments"
            description="Advanced, results-driven treatments delivered by our medical team."
          />
          <div className="mt-12">
            <ServicesSection services={services.slice(0, 4)} />
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="gold" size="lg">
              <Link href="/book">Book an Appointment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Video feature */}
      <VideoSection />

      {/* Testimonials */}
      <section className="container-px mx-auto max-w-7xl py-12 pb-24">
        <SectionHeading
          eyebrow="Loved By Many"
          title="What Our Clients Say"
        />
        <div className="mt-12">
          <Testimonials />
        </div>
      </section>

      {/* Promotional offers */}
      <PromoBanners />

      <Newsletter />
    </>
  );
}
