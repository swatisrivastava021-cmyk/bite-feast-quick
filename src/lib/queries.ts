import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  delivery_time: string;
  image_url: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
};

export type Address = {
  id: string;
  label: string;
  full_address: string;
  city: string;
  pincode: string;
  phone: string;
};

export type AddressInput = Omit<Address, "id">;

export type Order = {
  id: string;
  restaurant_name: string;
  address_text: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  order_items: { id: string; name: string; price: number; quantity: number }[];
};

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async (): Promise<Restaurant[]> => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, cuisine, rating, delivery_time, image_url")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRestaurant(id: string) {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => {
      const [restaurant, menu] = await Promise.all([
        supabase
          .from("restaurants")
          .select("id, name, cuisine, rating, delivery_time, image_url")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("menu_items")
          .select("id, name, description, price, image_url")
          .eq("restaurant_id", id)
          .order("created_at"),
      ]);
      if (restaurant.error) throw restaurant.error;
      if (menu.error) throw menu.error;
      return {
        restaurant: restaurant.data as Restaurant | null,
        menu: (menu.data ?? []) as MenuItem[],
      };
    },
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async (): Promise<Address[]> => {
      const { data, error } = await supabase
        .from("addresses")
        .select("id, label, full_address, city, pincode, phone")
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: AddressInput }) => {
      if (id) {
        const { error } = await supabase.from("addresses").update(values).eq("id", id);
        if (error) throw error;
        return;
      }
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError ?? new Error("Not signed in");
      const { error } = await supabase
        .from("addresses")
        .insert({ ...values, user_id: userData.user.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, restaurant_name, address_text, subtotal, delivery_fee, total, created_at, order_items(id, name, price, quantity)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async (): Promise<Order | null> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, restaurant_name, address_text, subtotal, delivery_fee, total, created_at, order_items(id, name, price, quantity)",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as Order | null) ?? null;
    },
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      restaurantId: string;
      restaurantName: string;
      addressText: string;
      subtotal: number;
      deliveryFee: number;
      total: number;
      items: { name: string; price: number; quantity: number }[];
    }) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError ?? new Error("Not signed in");

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: userData.user.id,
          restaurant_id: input.restaurantId,
          restaurant_name: input.restaurantName,
          address_text: input.addressText,
          subtotal: input.subtotal,
          delivery_fee: input.deliveryFee,
          total: input.total,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(input.items.map((item) => ({ ...item, order_id: order.id })));
      if (itemsError) throw itemsError;

      return order.id as string;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
