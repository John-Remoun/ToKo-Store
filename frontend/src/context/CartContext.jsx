import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { apiError, unwrap } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(unwrap(res));
    } catch (e) {
      // silent - cart may 401 briefly during token refresh
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = async (productId, quantity = 1) => {
    setBusy(true);
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      setCart(unwrap(res));
      toast.success('Added to cart');
      return true;
    } catch (e) {
      toast.error(apiError(e, 'Could not add to cart'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    setBusy(true);
    try {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      setCart(unwrap(res));
    } catch (e) {
      toast.error(apiError(e, 'Could not update item'));
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (productId) => {
    setBusy(true);
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      setCart(unwrap(res));
      toast.success('Removed from cart');
    } catch (e) {
      toast.error(apiError(e, 'Could not remove item'));
    } finally {
      setBusy(false);
    }
  };

  const clearCart = async () => {
    setBusy(true);
    try {
      const res = await api.delete('/cart');
      setCart(unwrap(res));
    } catch (e) {
      toast.error(apiError(e, 'Could not clear cart'));
    } finally {
      setBusy(false);
    }
  };

  const applyCoupon = async (code) => {
    setBusy(true);
    try {
      const res = await api.post('/cart/apply-coupon', { code });
      setCart(unwrap(res));
      toast.success('Coupon applied');
      return true;
    } catch (e) {
      toast.error(apiError(e, 'Invalid coupon'));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, busy, itemCount, refresh, addItem, updateItem, removeItem, clearCart, applyCoupon }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
