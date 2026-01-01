import { Search, Menu, User, Heart, LogOut, ShoppingBag, X, Phone, ChevronDown } from "lucide-react";
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

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar - Contact Info */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-secondary text-secondary-foreground overflow-hidden"
          >
            <div className="container-custom">
              <div className="flex items-center justify-between h-9 text-[11px]">
                <div className="flex items-center gap-6">
                  <a href="tel:+923328222026" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Phone className="w-3 h-3" />
                    <span className="font-semibold">+92 332 8222026</span>
                  </a>
                  <span className="hidden sm:block text-secondary-foreground/50">|</span>
                  <span className="hidden sm:block text-secondary-foreground/70">Free Shipping on Orders Above PKR 5,000</span>
                </div>
                <div className="hidden md:flex items-center gap-4 text-secondary-foreground/70">
                  <Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link>
                  <span className="text-secondary-foreground/30">•</span>
                  <Link to="/help" className="hover:text-primary transition-colors">Help</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <motion.div
        animate={{
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 1)",
          boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.08)" : "0 1px 0 rgba(0, 0, 0, 0.05)"
        }}
        transition={{ duration: 0.2 }}
        className="border-b border-border/30"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-[72px] gap-4">
            {/* Mobile Menu Toggle - Left side on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-10 h-10 rounded-xl hover:bg-muted -ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-primary rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md">
                  <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="font-bold text-lg md:text-xl tracking-tight text-foreground leading-none">
                  Pixel<span className="text-primary">Perfect</span>
                </span>
                <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">Premium Store</span>
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center flex-1 max-w-xl mx-6">
              <ul className="flex items-center gap-1">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.name}>
                    <Link
                      to={category.path}
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                {categories.length > 5 && (
                  <li>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 flex items-center gap-1">
                          More
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-48 p-2 rounded-xl shadow-lg border-border/50 bg-background">
                        {categories.slice(5).map((category) => (
                          <DropdownMenuItem key={category.name} asChild className="rounded-lg cursor-pointer py-2.5">
                            <Link to={category.path}>{category.name}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                )}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

              {/* Search Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-xl hover:bg-muted"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* User Menu - Desktop */}
              <div className="hidden sm:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-2 rounded-xl shadow-lg border-border/50 bg-background">
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link to="/account" className="flex items-center gap-2.5">
                          <User className="w-4 h-4" />
                          My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                        <Link to="/wishlist" className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4" />
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1.5" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="rounded-lg cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted" asChild>
                    <Link to="/auth">
                      <User className="w-5 h-5" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Wishlist - Desktop */}
              <Button variant="ghost" size="icon" className="hidden sm:flex w-10 h-10 rounded-xl hover:bg-muted" asChild>
                <Link to="/wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>

              {/* Cart - Always visible with emphasis */}
              <CartDrawer />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-background z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-5 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg">
                      Pixel<span className="text-primary">Perfect</span>
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search in Mobile */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-muted rounded-xl text-muted-foreground text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search products...
                </button>

                {/* Categories */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Categories</p>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="block px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Account Links */}
                <div className="pt-4 border-t border-border space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">Account</p>
                  {user ? (
                    <>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-[15px] font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex items-center gap-3 px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Sign In / Register
                    </Link>
                  )}
                </div>

                {/* Help Links */}
                <div className="pt-4 border-t border-border space-y-1">
                  <Link
                    to="/track-order"
                    className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Order
                  </Link>
                  <Link
                    to="/help"
                    className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Help Center
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};