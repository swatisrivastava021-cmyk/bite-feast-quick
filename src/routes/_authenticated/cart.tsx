import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/Feedback";
import { Page, PageHeader } from "@/components/PageHeader";
import { useCart } from "@/lib/cart";
import { formatRupees } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — QuickBite" },
      { name: "description", content: "Review your QuickBite cart before checkout." },
      { property: "og:title", content: "Your cart — QuickBite" },
      { property: "og:description", content: "Adjust quantities and see your order total." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, restaurantName, subtotal, deliveryFee, total, increment, decrement, removeItem } =
    useCart();

  if (!items.length) {
    return (
      <Page>
        <PageHeader title="Your cart" />
        <EmptyState
          title="Your cart is empty"
          description="Add a few dishes from any restaurant and they'll show up here."
          action={
            <Link
              to="/restaurants"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Browse restaurants
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Your cart" subtitle={restaurantName ? `From ${restaurantName}` : undefined} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                width={600}
                height={600}
                loading="lazy"
                className="size-20 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatRupees(item.price)} each
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border p-1">
                <button
                  onClick={() => decrement(item.id)}
                  aria-label={`Decrease quantity of ${item.name}`}
                  className="grid size-8 place-items-center rounded-full transition hover:bg-muted"
                >
                  <Minus className="size-4" aria-hidden />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => increment(item.id)}
                  aria-label={`Increase quantity of ${item.name}`}
                  className="grid size-8 place-items-center rounded-full transition hover:bg-muted"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </div>
              <span className="w-20 text-right font-display font-bold">
                {formatRupees(item.price * item.quantity)}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name}`}
                className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Bill summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Subtotal" value={formatRupees(subtotal)} />
            <Row label="Delivery fee" value={formatRupees(deliveryFee)} />
            <div className="border-t border-border pt-3">
              <Row label="Total" value={formatRupees(total)} strong />
            </div>
          </dl>
          <Link
            to="/checkout"
            className="mt-6 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </Page>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "font-display text-base font-bold" : "font-medium"}>{value}</dd>
    </div>
  );
}
