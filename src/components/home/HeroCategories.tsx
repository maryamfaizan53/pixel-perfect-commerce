import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/api";
import { CategoryCards } from "@/components/common/CategoryCards";
import { SectionHeader } from "@/components/common/SectionHeader";

export const HeroCategories = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const featured = categories.filter((c) => c.featured);
  const show = (featured.length ? featured : categories).filter((c) => c.slug !== "more").slice(0, 8);

  return (
    <section className="py-14 sm:py-20 bg-background">
      <div className="container-custom">
        <SectionHeader
          eyebrow="Browse the store"
          title="Shop by category"
          subtitle="Kitchen tools, organizers, beauty, and everyday lifestyle picks."
          viewAllHref="/category"
          viewAllLabel="All categories"
        />

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : (
          <CategoryCards categories={show} />
        )}
      </div>
    </section>
  );
};
