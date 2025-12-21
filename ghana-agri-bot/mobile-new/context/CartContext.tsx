import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define your product type (adjust as needed)
export interface CartProduct {
  id: string;
  name: string;
  price: string;
  unit: string;
  image?: string;
  quantity?: number;
  [key: string]: any; // for extra fields
}

interface CartContextType {
  cart: CartProduct[];
  wishlist: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addToWishlist: (product: CartProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [wishlist, setWishlist] = useState<CartProduct[]>([]);

  const addToCart = (product: CartProduct) => {
    setCart(prev =>
      prev.find(p => p.id === product.id)
        ? prev.map(p => p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p)
        : [...prev, { ...product, quantity: 1 }]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addToWishlist = (product: CartProduct) => {
    setWishlist(prev =>
      prev.find(p => p.id === product.id) ? prev : [...prev, product]
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const isInCart = (productId: string) => cart.some(p => p.id === productId);
  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInCart,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for easy usage
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};