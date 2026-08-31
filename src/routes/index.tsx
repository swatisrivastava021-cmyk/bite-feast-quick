import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ShieldCheck, Truck } from "lucide-react";
import { Page } from "@/components/PageHeader";
import { RestaurantGrid } from "@/components/RestaurantGrid";
import { Spinner } from "@/components/Feedback";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuickBite — Food delivery from local favourites" },
      {
        name: "description",
        content:
          "Browse six handpicked restaurants, build your cart and get hot food delivered for a flat ₹40 fee.",
      },
      { property: "og:title", content: "QuickBite — Food delivery from local favourites" },
      {
        property: "og:description",
        content: "Order North Indian, Japanese, Italian, healthy, American and street food.",
      },
    ],
  }),
  component: Index,
});

const highlights = [
  { icon: Clock, title: "Fast delivery", text: "Most orders arrive in under 35 minutes." },
  { icon: Truck, title: "Flat ₹40 fee", text: "One simple delivery fee on every order." },
  { icon: ShieldCheck, title: "Saved addresses", text: "Check out in a couple of taps." },
];

function Index() {
  const { user, loading } = useAuth();

  return (
    <Page>
      <section className="overflow-hidden rounded-3xl bg-accent px-6 py-12 text-center sm:px-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">QuickBite</p>
        <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Great food from your neighbourhood, delivered hot
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Six kitchens, thirty dishes, one flat delivery fee. Pick a restaurant and we&apos;ll take
          it from there.
        </p>
        {!loading && !user ? (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Create an account
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-muted"
            >
              Log in to order
            </Link>
          </div>
        ) : null}
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <Icon className="size-5 text-primary" aria-hidden />
            <h2 className="mt-3 font-display text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold tracking-tight">Restaurants near you</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {user ? "Tap a restaurant to see its menu." : "Log in to view menus and place an order."}
        </p>
        <div className="mt-6">
          {loading ? <Spinner /> : user ? <RestaurantGrid /> : <LockedGrid />}
        </div>
      </section>
    </Page>
  );
}

function LockedGrid() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <h3 className="font-display text-lg font-semibold">Sign in to start ordering</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Create a free QuickBite account to browse menus, save addresses and track your orders.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Log in
      </Link>
    </div>
  );
}
