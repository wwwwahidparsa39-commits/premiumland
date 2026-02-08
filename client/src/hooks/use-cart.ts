import { useState, useEffect } from "react";
import { type Product } from "@shared/schema";

export type CartItem = Product & { q: number };

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("premium-land-cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("premium-land-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, q: item.q + 1 } : item
        );
      }
      return [...prev, { ...product, q: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, q: Math.max(1, item.q + delta) } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.q, 0);
  const count = cart.reduce((sum, item) => sum + item.q, 0);

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total, count };
}
