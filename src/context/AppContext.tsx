import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, getCart, saveCart, addToCart as addToCartLib, removeFromCart as removeLib, updateQuantity as updateQtyLib, clearCart as clearLib, getFavorites, toggleFavorite as toggleFavLib } from '../lib/cart';
import { Product } from '../lib/supabase';

type AppContextType = {
  cart: CartItem[];
  favorites: string[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (id: string) => void;
  cartCount: number;
  cartTotal: number;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => getCart());
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const addToCart = (product: Product, qty = 1) => {
    setCart(addToCartLib(product, qty));
  };

  const removeFromCart = (id: string) => {
    setCart(removeLib(id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart(removeLib(id));
    } else {
      setCart(updateQtyLib(id, qty));
    }
  };

  const clearCart = () => {
    clearLib();
    setCart([]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(toggleFavLib(id));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <AppContext.Provider value={{ cart, favorites, addToCart, removeFromCart, updateQuantity, clearCart, toggleFavorite, cartCount, cartTotal }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
