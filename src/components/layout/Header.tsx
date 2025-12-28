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
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { motion, AnimatePresence } from "framer-motion";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="bg-secondary text-secondary-foreground overflow-hidden border-b border-primary/20"
          >
            <div className="container-custom">
              <div className="flex items-center justify-center h-10 text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 mr-3 text-primary" />
                <span>Complimentary Shipping Worldwide</span>
                <Sparkles className="w-3 h-3 ml-3 text-primary" />
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
            <Link to="/" className="flex items-center gap-4 group shrink-0">
              <div className="relative">
                <div className="w-12 h-12 bg-secondary border border-primary/30 rounded-full flex items-center justify-center transition-all duration-700 group-hover:bg-primary group-hover:scale-105 group-hover:rotate-[360deg] shadow-lg">
                  <ShoppingBag className="w-5 h-5 text-primary group-hover:text-white transition-colors duration-500" />
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">
                  Pixel<span className="text-primary">Perfect</span>
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-1.5">International Boutique</span>
              </div>
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
              <ul className="flex items-center gap-1">
                {categories.slice(0, 6).map((category, idx) => (
                  <li key={category.name} className="relative group/nav">
                    <Link
                      to={category.path}
                      className="nav-link-premium text-muted-foreground hover:text-foreground relative z-10 flex items-center gap-2"
                    >
                      {category.name}
                      {idx < 2 && (
                        <motion.span
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                    <div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-500 origin-left" />
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-3">
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
                <span className="font-bold text-xl tracking-tight">
                  Pixel<span className="text-primary">Perfect</span>
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
