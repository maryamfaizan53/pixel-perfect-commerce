import { Search, Menu, User, Heart, LogOut, ShoppingBag, X, ChevronDown, Truck } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { getCategories } from "@/lib/api";
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
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "./AnnouncementBar";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Track Order", path: "/track-order" },
  { name: "Help", path: "/help" },
  { name: "Contact", path: "/contact" },
  { name: "Blog", path: "/blog" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const { data: collections = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const categories = collections.map((c) => ({ name: c.title, path: `/category/${c.slug}` }));

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Trust strip — collapses on scroll */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300",
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
        )}
      >
        <AnnouncementBar />
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b border-white/10 transition-[background-color,box-shadow] duration-300",
          scrolled ? "bg-secondary/90 backdrop-blur-md shadow-soft" : "bg-secondary",
        )}
      >
        <div className="container-custom">
          <div
            className={cn(
              "flex items-center gap-3 sm:gap-4 transition-[height] duration-300",
              scrolled ? "h-14" : "h-16",
            )}
          >
            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menu"
              className="lg:hidden p-2 -ml-2 text-white/90 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" />
              </span>
              <span className="font-extrabold text-lg text-white tracking-tight">
                AI<span className="text-primary"> Bazar</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/5 transition-colors flex items-center gap-1">
                    Categories
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl shadow-card border bg-popover max-h-[70vh] overflow-y-auto">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.name} asChild className="cursor-pointer py-2.5 rounded-lg">
                      <Link to={category.path}>{category.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {NAV_LINKS.filter((l) => l.name !== "Home").map((l) => (
                <Link
                  key={l.name}
                  to={l.path}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-full hover:bg-white/5 transition-colors",
                    pathname === l.path ? "text-primary" : "text-white/80 hover:text-white",
                  )}
                >
                  {l.name}
                </Link>
              ))}
            </nav>

            {/* Search pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex flex-1 max-w-md ml-auto items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-4 h-10 text-white/60 hover:text-white/80 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm">Search products…</span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-0.5 ml-auto lg:ml-0">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="lg:hidden p-2 text-white/90 hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden sm:flex p-2 text-white/90 hover:text-white transition-colors" aria-label="Account">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-card border bg-popover">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                      <Link to="/account" className="flex items-center gap-2"><User className="w-4 h-4" /> My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                      <Link to="/account" className="flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Your Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                      <Link to="/wishlist" className="flex items-center gap-2"><Heart className="w-4 h-4" /> Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-2.5 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" aria-label="Sign in" className="hidden sm:flex p-2 text-white/90 hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                </Link>
              )}

              <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:flex p-2 text-white/90 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </Link>

              <CartDrawer />
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="fixed top-0 left-0 bottom-0 w-[300px] bg-background z-50 lg:hidden overflow-y-auto"
            >
              <div className="bg-secondary text-secondary-foreground p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </span>
                  {user ? (
                    <span className="font-semibold text-sm">Hello, {user.email?.split("@")[0]}</span>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-sm">
                      Hello, Sign In
                    </Link>
                  )}
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-4 space-y-6">
                <div>
                  <h3 className="font-bold text-base mb-3">Shop by Category</h3>
                  <div className="space-y-0.5">
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        to={category.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border" />

                <div>
                  <h3 className="font-bold text-base mb-3">Help & Settings</h3>
                  <div className="space-y-0.5">
                    {user && (
                      <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                        Your Account
                      </Link>
                    )}
                    <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">Wishlist</Link>
                    <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">
                      <Truck className="w-4 h-4" /> Track Order
                    </Link>
                    <Link to="/help" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">Help Center</Link>
                    <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">Contact Us</Link>
                    <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="block py-2.5 px-3 text-sm text-foreground hover:bg-muted rounded-lg transition-colors">Blog</Link>
                    {user && (
                      <button
                        onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                        className="w-full text-left py-2.5 px-3 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
