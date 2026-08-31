import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { ErrorState, Spinner } from "@/components/Feedback";
import { Page } from "@/components/PageHeader";
import { useCart } from "@/lib/cart";
import { formatRupees } from "@/lib/format";
import { useRestaurant } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/restaurants/$restaurantId")({
  head: () => ({
    meta: [
      { title: "Menu — QuickBite" },
      { name: "description", content: "Browse the menu and add dishes to your QuickBite cart." },
      { property: "og:title", content: "Menu — QuickBite" },
      { property: "og:description", content: "Add dishes to your cart and check out in minutes." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { restaurantId } = Route.useParams();
  const { data, isPending, isError, refetch } = useRestaurant(restaurantId);
  const { addItem } = useCart();

  if (isPending) return <Page><Spinner label="Loading menu..." /></Page>;
  if (isError) return <Page><ErrorState message="We couldn't load this menu." onRetry={refetch} /></Page>;
  if (!data.restaurant)
    return (
      <Page>
        <ErrorState message="This restaurant is no longer available." />
      </Page>
    );

  const restaurant = data.restaurant;

  return (
    <Page>
      <Link
        to="/restaurants"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All restaurants
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <img
          src={restaurant.image_url}
          alt={`${restaurant.name} restaurant`}
          width={800}
          height={600}
          className="h-52 w-full object-cover sm:h-64"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {restaurant.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{restaurant.cuisine}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 font-semibold text-accent-foreground">
              <Star className="size-4 fill-current" aria-hidden />
              {restaurant.rating}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
              <Clock className="size-4" aria-hidden />
              {restaurant.delivery_time}
            </span>
          </div>
        </div>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold tracking-tight">Menu</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {data.menu.map((item) => (
          <li
            key={item.id}
            className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <img
              src={item.image_url}
              alt={item.name}
              width={600}
              height={600}
              loading="lazy"
              className="size-24 shrink-0 rounded-xl object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                <span className="font-display font-bold">{formatRupees(item.price)}</span>
                <button
                  onClick={() => {
                    const { replaced } = addItem(
                      { id: restaurant.id, name: restaurant.name },
                      {
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        imageUrl: item.image_url,
                      },
                    );
                    toast.success(
                      replaced
                        ? `Cart cleared and ${item.name} added — one restaurant per order.`
                        : `${item.name} added to cart`,
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Plus className="size-4" aria-hidden />
                  Add to Cart
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Page>
  );
}
