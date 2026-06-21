"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// The purchasable unit is a product variant (a size within a series).
export type CartItem = {
  variantId: string;
  sku: string;
  productName: string;
  size: string;
  priceCents: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotalCents: number;
  addItem: (variant: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (variant, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((i) => i.variantId === variant.variantId);
        if (existing) {
          return current.map((i) =>
            i.variantId === variant.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...current, { ...variant, quantity }];
      });
    };

    const setQuantity: CartContextValue["setQuantity"] = (
      variantId,
      quantity,
    ) => {
      setItems((current) =>
        quantity <= 0
          ? current.filter((i) => i.variantId !== variantId)
          : current.map((i) =>
              i.variantId === variantId ? { ...i, quantity } : i,
            ),
      );
    };

    const removeItem: CartContextValue["removeItem"] = (variantId) => {
      setItems((current) => current.filter((i) => i.variantId !== variantId));
    };

    const clear = () => setItems([]);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotalCents = items.reduce(
      (sum, i) => sum + i.priceCents * i.quantity,
      0,
    );

    return {
      items,
      totalItems,
      subtotalCents,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
