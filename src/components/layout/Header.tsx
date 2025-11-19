import { Search, Menu, User, Heart, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const categories = [
  { name: "Household", path: "/category/household" },
  { name: "Kitchen", path: "/category/kitchen" },
  { name: "Stationery", path: "/category/stationery" },
  { name: "Toys", path: "/category/toys" },
  { name: "Mobile Accessories", path: "/category/mobile" },
  { name: "Beauty", path: "/category/beauty" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };
  const [cartCount] = useState(0);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-custom">
          <div className="flex items-center justify-between h-10 text-sm">
            <p>Free shipping on orders over $50</p>
            <div className="hidden md:flex items-center gap-4">
              <Link to="/account" className="hover:underline flex items-center gap-1">
                <User className="w-4 h-4" />
                Account
              </Link>
              <Link to="/help" className="hover:underline">Help</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <ShoppingCart className="w-6 h-6" />
            ShopHub
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pr-12 h-12 border-2 border-input focus:border-primary"
              />
              <Button
                size="icon"
                className="absolute right-0 top-0 h-12 w-12 rounded-l-none bg-secondary hover:bg-secondary-hover"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
                <Link to="/auth">
                  <User className="w-5 h-5" />
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link to="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>
            
            <CartDrawer />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search bar - Mobile */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search products..."
              className="w-full pr-12 h-10 border-2 border-input focus:border-primary"
            />
            <Button size="icon" className="absolute right-0 top-0 h-10 w-10 rounded-l-none bg-secondary hover:bg-secondary-hover">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Categories navigation */}
        <nav className="hidden lg:block border-t border-border">
          <ul className="flex items-center gap-1 h-12">
            {categories.map((category) => (
              <li key={category.name}>
                <Link
                  to={category.path}
                  className="px-4 py-2 text-sm font-medium hover:text-primary hover:bg-muted rounded-md transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container-custom py-4">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li className="border-t border-border pt-2 mt-2">
                <Link
                  to="/account"
                  className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  Wishlist
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};
