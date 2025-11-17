import { Link } from "react-router-dom";
import { Home, Utensils, PenTool, Gamepad2, Smartphone, Sparkles } from "lucide-react";

const categories = [
  {
    name: "Household",
    icon: Home,
    path: "/category/household",
    color: "bg-blue-100 text-blue-700",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
  },
  {
    name: "Kitchen",
    icon: Utensils,
    path: "/category/kitchen",
    color: "bg-orange-100 text-orange-700",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop",
  },
  {
    name: "Stationery",
    icon: PenTool,
    path: "/category/stationery",
    color: "bg-purple-100 text-purple-700",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
  },
  {
    name: "Toys",
    icon: Gamepad2,
    path: "/category/toys",
    color: "bg-pink-100 text-pink-700",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop",
  },
  {
    name: "Mobile Accessories",
    icon: Smartphone,
    path: "/category/mobile",
    color: "bg-green-100 text-green-700",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop",
  },
  {
    name: "Beauty",
    icon: Sparkles,
    path: "/category/beauty",
    color: "bg-rose-100 text-rose-700",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
  },
];

export const CategoryGrid = () => {
  return (
    <section className="py-12">
      <div className="container-custom">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="group relative overflow-hidden rounded-lg bg-card border border-border hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="aspect-square relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className={`${category.color} p-3 rounded-full mb-2 bg-white/90`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-center px-2">{category.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
