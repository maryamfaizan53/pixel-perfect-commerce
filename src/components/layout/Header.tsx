import { Search, Menu, User, Heart, LogOut, ShoppingBag, X, Sparkles } from "lucide-react";
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
import { SearchBar } from "@/components/search/SearchBar";
import { motion, AnimatePresence } from "framer-motion";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
      {/* Announcement Bar */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-primary via-primary to-secondary overflow-hidden"
          >
            <div className="container-custom">
              <div className="flex items-center justify-center h-10 text-[11px] font-bold text-primary-foreground tracking-wide">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                <span>FREE SHIPPING ON ORDERS OVER PKR 5,000 • USE CODE: <span className="underline">WELCOME15</span></span>
                <Sparkles className="w-3.5 h-3.5 ml-2" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <motion.div
        animate={{
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 1)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          boxShadow: scrolled ? "0 4px 30px rgba(0, 0, 0, 0.1)" : "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}
        transition={{ duration: 0.3 }}
        className="border-b border-border/50"
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-105">
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-lg md:text-xl tracking-tight text-foreground leading-none">
                  LUXE<span className="text-primary">MART</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Premium Shopping</span>
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <ul className="flex items-center gap-1">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.name}>
                    <Link
                      to={category.path}
                      className="relative px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      {category.name}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full group-hover:w-6 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search */}
              <div className="hidden md:block">
                <SearchBar />
              </div>

              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden w-10 h-10 rounded-xl hover:bg-muted"
                onClick={() => {/* TODO: Mobile search modal */}}
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* User Menu */}
              <div className="hidden sm:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-border/50">
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                        <Link to="/account">
                          <User className="w-4 h-4 mr-3" />
                          My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
                        <Link to="/wishlist">
                          <Heart className="w-4 h-4 mr-3" />
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="rounded-xl cursor-pointer py-3 text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
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

              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hidden sm:flex w-10 h-10 rounded-xl hover:bg-muted group" asChild>
                <Link to="/wishlist">
                  <Heart className="w-5 h-5 group-hover:fill-secondary group-hover:text-secondary transition-all" />
                </Link>
              </Button>

              {/* Cart */}
              <CartDrawer />

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden w-10 h-10 rounded-xl hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
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
              className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] bg-background z-50 lg:hidden shadow-2xl overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <span className="font-black text-xl tracking-tight">
                    LUXE<span className="text-primary">MART</span>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-xl" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Search in Mobile */}
                <div className="pb-4 border-b border-border">
                  <SearchBar />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Shop</p>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="block px-4 py-3 text-base font-semibold text-foreground hover:bg-muted rounded-xl transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                {/* Account Links */}
                <div className="pt-4 border-t border-border space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Account</p>
                  <Link
                    to="/account"
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-foreground hover:bg-muted rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    My Account
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-foreground hover:bg-muted rounded-xl transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    Wishlist
                  </Link>
                  {user && (
                    <button
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-base font-semibold text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
