import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader } from "@/components/PageHeader";
import { RestaurantGrid } from "@/components/RestaurantGrid";

export const Route = createFileRoute("/_authenticated/restaurants/")({
  head: () => ({
    meta: [
      { title: "Restaurants — QuickBite" },
      { name: "description", content: "Browse QuickBite restaurants and open a menu to order." },
      { property: "og:title", content: "Restaurants — QuickBite" },
      { property: "og:description", content: "Six local kitchens ready to deliver." },
    ],
  }),
  component: RestaurantsPage,
});

function RestaurantsPage() {
  return (
    <Page>
      <PageHeader title="Restaurants" subtitle="Pick a kitchen and browse the menu." />
      <RestaurantGrid />
    </Page>
  );
}
