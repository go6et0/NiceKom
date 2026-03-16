"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  lineId: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  maxQuantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "nicekom-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Array<
        Partial<CartItem> & { productId: string; quantity: number }
      >;
      setItems(
        parsed.map((item) => ({
          lineId: item.lineId ?? item.variantId ?? item.productId,
          productId: item.productId,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
          name: item.name ?? "",
          price: Number(item.price ?? 0),
          image: item.image,
          quantity: Number(item.quantity ?? 1),
          maxQuantity: Number(item.maxQuantity ?? item.quantity ?? 1),
        }))
      );
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.lineId === item.lineId);
      if (!existing) return [...prev, item];
      return prev.map((p) =>
        p.lineId === item.lineId
          ? {
              ...p,
              quantity: Math.min(
                p.quantity + item.quantity,
                p.maxQuantity
              ),
            }
          : p
      );
    });
  };

  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId));
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.lineId === lineId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.maxQuantity)),
            }
          : item
      )
    );
  };

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
