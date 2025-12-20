import { Search, Menu, User, Heart, LogOut, ShoppingCart, X } from "lucide-react";
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
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-0"
        }`}
    >
      {/* Top bar - Hide on scroll for a cleaner look */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary text-primary-foreground overflow-hidden"
          >
            <div className="container-custom">
              <div className="flex items-center justify-between h-10 text-[11px] font-bold uppercase tracking-[0.2em]">
                <p>Free premium shipping on orders over $50</p>
                <div className="hidden md:flex items-center gap-6">
                  <Link to="/account" className="hover:text-white/80 transition-colors flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Account
                  </Link>
                  <Link to="/help" className="hover:text-white/80 transition-colors">Support</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header with glassmorphism */}
      <div
        className={`container-custom relative z-10 transition-all duration-300 ${scrolled
          ? "glass mt-2 rounded-2xl mx-4 sm:mx-8 lg:mx-auto"
          : "bg-background border-b border-border"
          }`}
      >
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
              SHOPHUB<span className="text-primary text-4xl leading-[0]">.</span>
            </span>
          </Link>

          {/* Categories navigation - Desktop */}
          <nav className="hidden xl:block">
            <ul className="flex items-center gap-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className="nav-link-premium"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Search bar - Desktop (Hidden on small desktops to save space) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-primary/5">
                      <User className="w-5 h-5 text-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl glass">
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link to="/account" className="cursor-pointer py-3">
                        <User className="w-4 h-4 mr-3" />
                        Account Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link to="/wishlist" className="cursor-pointer py-3">
                        <Heart className="w-4 h-4 mr-3" />
                        Saved Items
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer py-3 text-destructive focus:text-destructive rounded-xl"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-primary/5" asChild>
                  <Link to="/auth">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
              )}

              <Button variant="ghost" size="icon" className="w-11 h-11 rounded-xl hover:bg-secondary/5 group" asChild>
                <Link to="/wishlist">
                  <Heart className="w-5 h-5 group-hover:fill-secondary group-hover:text-secondary transition-all" />
                </Link>
              </Button>
            </div>

            <CartDrawer />

            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden w-11 h-11 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Advanced Framer Motion Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[300px] glass-dark z-50 xl:hidden overflow-y-auto"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-white font-black text-2xl">MENU</span>
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest pl-4">Collections</p>
                  <nav>
                    <ul className="space-y-1">
                      {categories.map((category) => (
                        <li key={category.name}>
                          <Link
                            to={category.path}
                            className="block px-4 py-3 text-lg font-bold text-white hover:text-primary transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/10">
                  <Link
                    to="/account"
                    className="flex items-center gap-4 px-4 py-3 text-white/80 font-bold hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Account Details
                  </Link>
                  <Link
                    to="/wishlist"
                    className="flex items-center gap-4 px-4 py-3 text-white/80 font-bold hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="w-5 h-5" />
                    Your Wishlist
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
