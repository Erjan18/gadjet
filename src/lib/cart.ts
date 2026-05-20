import { Product } from './supabase';

export type CartItem = {
  product: Product;
  quantity: number;
};

const CART_KEY = 'gadjet_cart';
const FAVORITES_KEY = 'gadjet_favorites';

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.product.id === product.id);
  if (idx >= 0) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((i) => i.product.id !== productId);
  saveCart(cart);
  return cart;
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart().map((i) =>
    i.product.id === productId ? { ...i, quantity } : i
  );
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(productId: string): string[] {
  const favs = getFavorites();
  const idx = favs.indexOf(productId);
  if (idx >= 0) {
    favs.splice(idx, 1);
  } else {
    favs.push(productId);
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return favs;
}
