import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, MapPin, ReceiptText, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { to: "/addresses", label: "Addresses", icon: MapPin },
  { to: "/orders", label: "Orders", icon: ReceiptText },
] as const;

export function Navbar() {
  const { user } = useAuth();
  const { count, clear } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-5" aria-hidden />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">QuickBite</span>
        </Link>

        {user ? (
          <nav className="flex items-center gap-1 sm:gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
              >
                <Icon className="size-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <ShoppingCart className="size-4" aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
            <button
              onClick={handleSignOut}
              className="ml-1 flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </nav>
        ) : (
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
