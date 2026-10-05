"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cart } from "@/types";
import { cartApi } from "@/lib/api";
import { useAuth } from "./auth-context";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const emptyCart: Cart = { id: "", items: [], itemCount: 0, subtotal: 0 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await cartApi.get(token);
      setCart(res.data ?? emptyCart);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      const res = await cartApi.add({ productId, quantity }, token);
      setCart(res.data ?? emptyCart);
    },
    [token]
  );

  const updateQty = useCallback(
    async (itemId: string, quantity: number) => {
      const res = await cartApi.update(itemId, quantity, token);
      setCart(res.data ?? emptyCart);
    },
    [token]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const res = await cartApi.remove(itemId, token);
      setCart(res.data ?? emptyCart);
    },
    [token]
  );

  const clear = useCallback(async () => {
    const res = await cartApi.clear(token);
    setCart(res.data ?? emptyCart);
  }, [token]);

  const itemCount = cart?.itemCount ?? cart?.items?.length ?? 0;

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount,
      refresh,
      addItem,
      updateQty,
      removeItem,
      clear,
    }),
    [cart, loading, itemCount, refresh, addItem, updateQty, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
