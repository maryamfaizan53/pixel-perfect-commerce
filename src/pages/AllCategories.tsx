import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { useSEO } from "@/hooks/useSEO";

const AllCategories = () => {
    useSEO({
        title: "All Product Categories - Shop Electronics, Kitchen, Beauty & More",
        description: "Browse all product categories at AI Bazar Pakistan. Shop electronics, kitchen gadgets, health & beauty, home decor, mother & baby care products at the lowest prices.",
        keywords: "aibazar categories, online shopping categories pakistan, electronics, kitchen accessories, beauty products, home decor, baby care",
        canonical: "https://www.aibazar.pk/category"
    });

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 pt-24">
                <CategoryGrid limit={100} showHeading={true} />
            </main>
            <Footer />
        </div>
    );
};

export default AllCategories;
