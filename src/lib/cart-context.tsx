"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  images: { url: string; altText?: string | null }[];
}

interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: CartProduct;
}

interface CartData {
  id: string;
  items: CartItemData[];
}

interface CartContextType {
  cart: CartData | null;
  total: number;
  itemCount: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
  removeItem: (cartItemId: string) => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("zoryn_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("zoryn_session_id", id);
  }
  return id;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const sessionId = getSessionId();
      const res = await fetch("/api/cart", {
        headers: { "x-session-id": sessionId },
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        setTotal(data.total);
        setItemCount(data.itemCount);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const sessionId = getSessionId();
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart);
          setTotal(data.total);
          setItemCount(data.itemCount);
          return { success: true };
        }
        const err = await res.json();
        return { success: false, error: err.error || "Erreur" };
      } catch {
        return { success: false, error: "Erreur réseau" };
      }
    },
    []
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      try {
        const sessionId = getSessionId();
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
          },
          body: JSON.stringify({ quantity }),
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart);
          setTotal(data.total);
          setItemCount(data.itemCount);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const removeItem = useCallback(
    async (cartItemId: string) => {
      try {
        const sessionId = getSessionId();
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "DELETE",
          headers: { "x-session-id": sessionId },
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart);
          setTotal(data.total);
          setItemCount(data.itemCount);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  return (
    <CartContext.Provider
      value={{ cart, total, itemCount, loading, addItem, updateQuantity, removeItem, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
