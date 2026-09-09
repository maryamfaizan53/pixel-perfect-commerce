import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false, soon: true },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false, soon: true },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false, soon: true },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end, soon }) =>
        soon ? (
          <span
            key={to}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/30 cursor-not-allowed"
          >
            <Icon className="w-4 h-4" /> {label}
            <span className="ml-auto text-[10px] uppercase tracking-wide text-white/25">soon</span>
          </span>
        ) : (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5",
              )
            }
          >
            <Icon className="w-4 h-4" /> {label}
          </NavLink>
        ),
      )}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { email } = useAdminAuth();

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col bg-secondary text-secondary-foreground p-4 sticky top-0 h-screen">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-3 mb-4">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-sm">
            AB
          </span>
          <span className="font-bold text-white">Dashboard</span>
        </Link>
        <NavItems />
        <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
          <a
            href="https://aibazar.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5"
          >
            <ExternalLink className="w-4 h-4" /> View store
          </a>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
          {email && <p className="px-3 pt-1 text-[11px] text-white/30 truncate">{email}</p>}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-secondary text-secondary-foreground px-4 h-14">
        <Link to="/admin" className="flex items-center gap-2 font-bold text-white">
          <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-xs">
            AB
          </span>
          Dashboard
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Menu">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-secondary text-secondary-foreground p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-white px-2">Menu</span>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavItems onNavigate={() => setOpen(false)} />
            <div className="mt-auto pt-4 border-t border-white/10">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
