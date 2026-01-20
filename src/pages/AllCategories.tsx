import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CategoryGrid } from "@/components/home/CategoryGrid";

const AllCategories = () => {
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
