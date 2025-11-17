import { ProductCard } from "@/components/product/ProductCard";

const featuredProducts = [
  {
    id: "1",
    name: "Premium Stainless Steel Cookware Set",
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.5,
    reviewCount: 342,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop",
    badge: "sale" as const,
    category: "Kitchen",
  },
  {
    id: "2",
    name: "Wireless Bluetooth Headphones",
    price: 79.99,
    rating: 4.8,
    reviewCount: 523,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    badge: "bestseller" as const,
    category: "Mobile Accessories",
  },
  {
    id: "3",
    name: "Organic Skincare Set",
    price: 49.99,
    rating: 4.6,
    reviewCount: 287,
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop",
    badge: "new" as const,
    category: "Beauty",
  },
  {
    id: "4",
    name: "Educational Building Blocks Set",
    price: 34.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviewCount: 612,
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop",
    badge: "sale" as const,
    category: "Toys",
  },
  {
    id: "5",
    name: "Premium Notebook Bundle",
    price: 24.99,
    rating: 4.4,
    reviewCount: 156,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop",
    category: "Stationery",
  },
  {
    id: "6",
    name: "Smart Home Speaker",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.7,
    reviewCount: 891,
    image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&h=400&fit=crop",
    badge: "sale" as const,
    category: "Household",
  },
  {
    id: "7",
    name: "Professional Chef Knife Set",
    price: 149.99,
    rating: 4.8,
    reviewCount: 423,
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop",
    badge: "bestseller" as const,
    category: "Kitchen",
  },
  {
    id: "8",
    name: "Wireless Charging Pad",
    price: 29.99,
    rating: 4.3,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1591290619762-c588f34f80b8?w=400&h=400&fit=crop",
    badge: "new" as const,
    category: "Mobile Accessories",
  },
];

export const FeaturedProducts = () => {
  return (
    <section className="py-12 bg-muted">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <a href="/products" className="text-primary hover:underline font-medium">
            View All →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};
