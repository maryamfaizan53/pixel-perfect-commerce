import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryCards } from "@/components/common/CategoryCards";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";

const AllCategories = () => {
  useSEO({
    title: "All Product Categories - Shop Kitchen, Beauty, Home & More",
    description:
      "Browse all product categories at AI Bazar Pakistan. Kitchen gadgets, health & beauty, home & living, baby care and more at the lowest prices with Cash on Delivery.",
    keywords:
      "aibazar categories, online shopping categories pakistan, kitchen accessories, beauty products, home decor, baby care",
    canonical: "https://www.aibazar.pk/category",
  });

  const { data: categories = [], isLoading } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const show = categories.filter((c) => c.slug !== "more");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container-custom">
          <SectionHeader
            eyebrow="Browse the store"
            title="All categories"
            subtitle="Everything on AI Bazar, organised."
          />
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <CategoryCards categories={show} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllCategories;
