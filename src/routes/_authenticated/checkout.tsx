import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, ErrorState, Spinner } from "@/components/Feedback";
import { Page, PageHeader } from "@/components/PageHeader";
import { useCart } from "@/lib/cart";
import { formatRupees } from "@/lib/format";
import { useAddresses, usePlaceOrder } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — QuickBite" },
      { name: "description", content: "Choose a delivery address and place your QuickBite order." },
      { property: "og:title", content: "Checkout — QuickBite" },
      { property: "og:description", content: "Confirm your address and order summary." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const { data: addresses, isPending, isError, refetch } = useAddresses();
  const placeOrder = usePlaceOrder();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!cart.items.length) {
    return (
      <Page>
        <PageHeader title="Checkout" />
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty. Add a few dishes first."
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

  const activeId = selectedId ?? addresses?.[0]?.id ?? null;

  function handlePlaceOrder() {
    const address = addresses?.find((a) => a.id === activeId);
    if (!address || !cart.restaurantId || !cart.restaurantName) {
      toast.error("Please pick a delivery address first.");
      return;
    }

    placeOrder.mutate(
      {
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName,
        addressText: `${address.label} — ${address.full_address}, ${address.city} ${address.pincode} (${address.phone})`,
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        total: cart.total,
        items: cart.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: (orderId) => {
          cart.clear();
          navigate({ to: "/orders/$orderId", params: { orderId }, search: { placed: true } });
        },
        onError: () => toast.error("We couldn't place your order. Please try again."),
      },
    );
  }

  return (
    <Page>
      <PageHeader title="Checkout" subtitle={`Delivering from ${cart.restaurantName}`} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="font-display text-lg font-semibold">Delivery address</h2>
          <div className="mt-4">
            {isPending ? <Spinner label="Loading addresses..." /> : null}
            {isError ? <ErrorState message="We couldn't load your addresses." onRetry={refetch} /> : null}
            {addresses && addresses.length === 0 ? (
              <EmptyState
                title="No saved addresses"
                description="Add a delivery address to continue with your order."
                action={
                  <Link
                    to="/addresses"
                    className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    Add address
                  </Link>
                }
              />
            ) : null}
            {addresses && addresses.length > 0 ? (
              <ul className="space-y-3">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-5 transition ${
                        activeId === address.id
                          ? "border-primary bg-accent/60"
                          : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-primary"
                        checked={activeId === address.id}
                        onChange={() => setSelectedId(address.id)}
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 font-semibold">
                          <MapPin className="size-4 text-primary" aria-hidden />
                          {address.label}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {address.full_address}, {address.city} — {address.pincode}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Phone: {address.phone}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">{formatRupees(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatRupees(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd className="font-medium">{formatRupees(cart.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-base font-bold">{formatRupees(cart.total)}</dd>
            </div>
          </dl>
          <button
            onClick={handlePlaceOrder}
            disabled={placeOrder.isPending || !activeId}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {placeOrder.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Place Order
          </button>
        </aside>
      </div>
    </Page>
  );
}
