import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Heart, Settings, User, Loader2 } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { OrderCard } from "@/components/orders/OrderCard";
import { ProfileSettings } from "@/components/account/ProfileSettings";
import { AddressManager } from "@/components/account/AddressManager";
import { AccountSettings } from "@/components/account/AccountSettings";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProductByHandle, ShopifyProduct } from "@/lib/shopify";

const Account = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { wishlistItems, loading: wishlistLoading } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const navigate = useNavigate();

  // Fetch products for wishlist items
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlistItems.length === 0) {
        setWishlistProducts([]);
        return;
      }

      setLoadingProducts(true);
      try {
        const products = await Promise.all(
          wishlistItems.map(item => fetchProductByHandle(item.product_handle))
        );
        setWishlistProducts(products.filter((p): p is ShopifyProduct => p !== null));
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlistItems]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 bg-muted">
        <div className="container-custom">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="addresses">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Addresses</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist">
                <Heart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      When you make a purchase, your orders will appear here.
                    </p>
                    <Button asChild>
                      <Link to="/">Start Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </TabsContent>

            <TabsContent value="addresses">
              <AddressManager />
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-4">
              {wishlistLoading || loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : wishlistProducts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start adding products you love!
                    </p>
                    <Button asChild>
                      <Link to="/category/all">Browse Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {wishlistProducts.map((product) => (
                    <ProductCard key={product.node.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <AccountSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;