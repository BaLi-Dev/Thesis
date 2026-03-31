"use client";
import { createContext, useContext, useState, useEffect } from "react";

type CartItem = { id: number; name: string; price: number; qty: number };
type CartCtx = { items: CartItem[]; add: (p: CartItem) => void; remove: (id: number) => void };

const CartContext = createContext<CartCtx>({ items: [], add: () => {}, remove: () => {} });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  function add(product: CartItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const next = existing
        ? prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  }

  function remove(id: number) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  }

  return <CartContext.Provider value={{ items, add, remove }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
