import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin } from "lucide-react";
import { EmptyState, ErrorState, Spinner } from "@/components/Feedback";
import { Page, PageHeader } from "@/components/PageHeader";
import { formatDate, formatRupees } from "@/lib/format";
import { useOrder } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/orders/$orderId")({
  validateSearch: (search: Record<string, unknown>) => ({
    placed: search.placed === true || search.placed === "true",
  }),
  head: () => ({
    meta: [
      { title: "Order details — QuickBite" },
      { name: "description", content: "Your QuickBite order confirmation and summary." },
      { property: "og:title", content: "Order details — QuickBite" },
      { property: "og:description", content: "Order confirmation and summary." },
    ],
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { placed } = Route.useSearch();
  const { data: order, isPending, isError, refetch } = useOrder(orderId);

  if (isPending) {
    return (
      <Page>
        <Spinner label="Loading your order..." />
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <PageHeader title="Order details" />
        <ErrorState message="We couldn't load this order." onRetry={refetch} />
      </Page>
    );
  }

  if (!order) {
    return (
      <Page>
        <PageHeader title="Order details" />
        <EmptyState
          title="Order not found"
          description="We couldn't find this order on your account."
          action={
            <Link
              to="/orders"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Back to my orders
            </Link>
          }
        />
      </Page>
    );
  }

  return (
    <Page>
      {placed ? (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-primary bg-accent/60 p-6">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Order confirmed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Thanks for ordering from {order.restaurant_name}. Your food is on its way.
            </p>
          </div>
        </div>
      ) : null}

      <PageHeader
        title={order.restaurant_name}
        subtitle={`Order #${order.id.slice(0, 8).toUpperCase()} · ${formatDate(order.created_at)}`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="font-display text-lg font-semibold">Items</h2>
          <ul className="mt-4 space-y-3">
            {order.order_items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"
              >
                <span className="min-w-0">
                  <span className="block font-semibold">{item.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {formatRupees(item.price)} × {item.quantity}
                  </span>
                </span>
                <span className="font-medium">{formatRupees(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 font-display text-lg font-semibold">Delivered to</h2>
          <p className="mt-3 flex items-start gap-2 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            {order.address_text}
          </p>
        </section>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold">Payment summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatRupees(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery fee</dt>
              <dd className="font-medium">{formatRupees(order.delivery_fee)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="font-semibold">Total paid</dt>
              <dd className="font-display text-base font-bold">{formatRupees(order.total)}</dd>
            </div>
          </dl>

          <Link
            to="/orders"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            View all orders
          </Link>
          <Link
            to="/restaurants"
            className="mt-3 flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Order again
          </Link>
        </aside>
      </div>
    </Page>
  );
}
