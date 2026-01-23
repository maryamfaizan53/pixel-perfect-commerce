import { Header } from "@/components/layout/Header";
import { HeroCategories } from "@/components/home/HeroCategories";
import { CategoryProductRow } from "@/components/home/CategoryProductRow";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
const SEOContentLazy = lazy(() => import("@/components/home/SEOContent").then(m => ({ default: m.SEOContent })));
const FooterLazy = lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-500 text-white p-20 text-center">
      <h1 className="text-6xl font-black mb-10 tracking-tighter shadow-2xl">
        DIAGNOSTIC TEST: IF YOU SEE THIS, THE CODE IS UPDATING
      </h1>
      <p className="text-2xl font-bold opacity-80">
        If you see the old site, please let me know immediately.
      </p>
    </div>
  );
};

export default Index;


