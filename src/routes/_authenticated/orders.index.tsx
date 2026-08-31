import { createFileRoute, Link } from "@tanstack/react-router";
import { ReceiptText } from "lucide-react";
import { EmptyState, ErrorState, Spinner } from "@/components/Feedback";
import { Page, PageHeader } from "@/components/PageHeader";
import { formatDate, formatRupees } from "@/lib/format";
import { useOrders } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — QuickBite" },
      { name: "description", content: "Review your previous QuickBite orders." },
      { property: "og:title", content: "My orders — QuickBite" },
      { property: "og:description", content: "Every order you have placed on QuickBite." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders, isPending, isError, refetch } = useOrders();

  return (
    <Page>
      <PageHeader title="My orders" subtitle="Every order you have placed on QuickBite" />

      {isPending ? <Spinner label="Loading your orders..." /> : null}

      {isError ? <ErrorState message="We couldn't load your orders." onRetry={refetch} /> : null}

      {orders && orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Once you place your first order it will show up here."
          action={
            <Link
              to="/restaurants"
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Browse restaurants
            </Link>
          }
        />
      ) : null}

      {orders && orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to="/orders/$orderId"
                params={{ orderId: order.id }}
                className="block rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:bg-muted/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                      <ReceiptText className="size-4 text-primary" aria-hidden />
                      {order.restaurant_name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <p className="font-display text-base font-bold">{formatRupees(order.total)}</p>
                </div>

                <p className="mt-3 truncate text-sm text-muted-foreground">
                  {order.order_items
                    .map((item) => `${item.name} × ${item.quantity}`)
                    .join(", ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Page>
  );
}
