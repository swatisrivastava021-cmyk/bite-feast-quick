import { Link } from "@tanstack/react-router";
import { Clock, Star } from "lucide-react";
import { ErrorState, Spinner } from "@/components/Feedback";
import { useRestaurants, type Restaurant } from "@/lib/queries";

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      to="/restaurants/$restaurantId"
      params={{ restaurantId: restaurant.id }}
      className="group overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      <img
        src={restaurant.image_url}
        alt={`${restaurant.name} restaurant`}
        width={800}
        height={600}
        loading="lazy"
        className="h-44 w-full object-cover transition group-hover:scale-105"
      />
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold">{restaurant.name}</h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            <Star className="size-3.5 fill-current" aria-hidden />
            {restaurant.rating}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden />
          {restaurant.delivery_time}
        </p>
      </div>
    </Link>
  );
}

export function RestaurantGrid() {
  const { data, isPending, isError, refetch } = useRestaurants();

  if (isPending) return <Spinner label="Loading restaurants..." />;
  if (isError) return <ErrorState message="We couldn't load restaurants." onRetry={refetch} />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
