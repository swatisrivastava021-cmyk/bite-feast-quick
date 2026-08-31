import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DELIVERY_FEE } from "./format";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartState = {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
};

const EMPTY: CartState = { restaurantId: null, restaurantName: null, items: [] };
const STORAGE_KEY = "quickbite-cart";

type CartValue = CartState & {
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (
    restaurant: { id: string; name: string },
    item: Omit<CartItem, "quantity">,
  ) => { replaced: boolean };
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as CartState);
    } catch {
      setState(EMPTY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<CartValue>(() => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = state.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      ...state,
      count,
      subtotal,
      deliveryFee: state.items.length ? DELIVERY_FEE : 0,
      total: subtotal + (state.items.length ? DELIVERY_FEE : 0),
      addItem: (restaurant, item) => {
        let replaced = false;
        setState((prev) => {
          if (prev.restaurantId && prev.restaurantId !== restaurant.id) {
            replaced = true;
            return {
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              items: [{ ...item, quantity: 1 }],
            };
          }
          const existing = prev.items.find((i) => i.id === item.id);
          return {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            items: existing
              ? prev.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
              : [...prev.items, { ...item, quantity: 1 }],
          };
        });
        return { replaced };
      },
      increment: (id) =>
        setState((prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
        })),
      decrement: (id) =>
        setState((prev) => {
          const items = prev.items
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
            .filter((i) => i.quantity > 0);
          return items.length ? { ...prev, items } : EMPTY;
        }),
      removeItem: (id) =>
        setState((prev) => {
          const items = prev.items.filter((i) => i.id !== id);
          return items.length ? { ...prev, items } : EMPTY;
        }),
      clear: () => setState(EMPTY),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
