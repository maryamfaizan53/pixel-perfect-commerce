import { Search, Menu, User, Heart, LogOut, ShoppingBag, X, ChevronDown, MapPin, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { items } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(10),
  });

  const categories = collections.map(col => ({
    name: col.node.title,
    path: `/category/${col.node.handle}`
  }));

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      {/* Top Bar - Dark themed */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <div className="flex items-center justify-between h-10 text-xs">
            {/* Left - Delivery Info */}
            <div className="hidden md:flex items-center gap-2 text-secondary-foreground/80 hover:text-white cursor-pointer transition-colors">
              <MapPin className="w-4 h-4" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] text-secondary-foreground/60">Deliver to</span>
                <span className="font-semibold text-sm">Pakistan</span>
              </div>
            </div>

            {/* Center - Search Bar (Desktop) */}
            <div className="flex-1 max-w-2xl mx-4 hidden lg:block">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center bg-white rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all"
              >
                <span className="flex-1 text-left px-4 py-2.5 text-muted-foreground text-sm">
                  Search products, brands and more...
                </span>
                <div className="bg-primary hover:bg-primary/90 px-4 py-2.5 transition-colors">
                  <Search className="w-5 h-5 text-primary-foreground" />
                </div>
              </button>
            </div>

            {/* Right - Account & Orders */}
            <div className="flex items-center gap-1">
              {/* Account Dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-start px-3 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all">
                      <span className="text-[10px] text-secondary-foreground/70">Hello, {user.email?.split('@')[0]}</span>
                      <span className="font-semibold text-sm flex items-center gap-1">
                        Account & Lists
                        <ChevronDown className="w-3 h-3" />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-lg shadow-xl border bg-background">
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                      <Link to="/account" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                      <Link to="/account" className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        Your Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-md">
                      <Link to="/wishlist" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer py-2.5 rounded-md text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/auth"
                  className="flex flex-col items-start px-3 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
                >
                  <span className="text-[10px] text-secondary-foreground/70">Hello, Sign in</span>
                  <span className="font-semibold text-sm flex items-center gap-1">
                    Account & Lists
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </Link>
              )}

              {/* Returns & Orders */}
              <Link
                to="/account"
                className="hidden sm:flex flex-col items-start px-3 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                <span className="text-[10px] text-secondary-foreground/70">Returns</span>
                <span className="font-semibold text-sm">& Orders</span>
              </Link>

              {/* Cart */}
              <CartDrawer />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-secondary/95 border-t border-white/10">
        <div className="container-custom">
          <div className="flex items-center h-11 gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-2 py-1.5 text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">All</span>
            </button>

            {/* Logo - Mobile & Desktop */}
            <Link to="/" className="flex items-center gap-2 px-2 py-1 hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">
                AI<span className="text-primary"> Bazar</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-2">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                Home
              </Link>
              
              {/* All Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all flex items-center gap-1">
                    All Categories
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2 rounded-lg shadow-xl border bg-background">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.name} asChild className="cursor-pointer py-2.5 rounded-md">
                      <Link to={category.path}>{category.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/track-order"
                className="px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" />
                Track Order
              </Link>

              <Link
                to="/help"
                className="px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                Help
              </Link>

              <Link
                to="/contact"
                className="px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                Contact
              </Link>
            </nav>

            {/* Right Side - Search (Mobile) & Wishlist */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="lg:hidden p-2 text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="hidden sm:flex p-2 text-secondary-foreground hover:outline hover:outline-1 hover:outline-white rounded-sm transition-all"
              >
                <Heart className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-background z-50 lg:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                  {user ? (
                    <span className="font-semibold">Hello, {user.email?.split('@')[0]}</span>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="font-semibold">
                      Hello, Sign In
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Menu Content */}
              <div className="p-4 space-y-6">
                {/* Shop by Category */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Shop by Category</h3>
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2.5 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border" />

                {/* Help & Settings */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Help & Settings</h3>
                  <div className="space-y-1">
                    {user && (
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2.5 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        Your Account
                      </Link>
                    )}
                    <Link
                      to="/wishlist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      Track Order
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      Help Center
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 px-3 text-foreground hover:bg-muted rounded-md transition-colors"
                    >
                      Contact Us
                    </Link>
                    {user && (
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left py-2.5 px-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
