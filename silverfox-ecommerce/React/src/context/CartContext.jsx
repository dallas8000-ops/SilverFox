import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

// Hook export is intentional; Fast Refresh treats this module as a component boundary.
// eslint-disable-next-line react-refresh/only-export-components -- useCart must live with context
export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart(prev => {
      // If item with same id, size, and currency exists, update quantity
      const idx = prev.findIndex(
        c => c.id === item.id && c.size === item.size && c.currency === item.currency
      );
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}
