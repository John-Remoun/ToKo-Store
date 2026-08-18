import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { apiError, unwrap } from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setItems(unwrap(res) || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = new Set(items.map((p) => p._id || p));

  const toggle = async (productId) => {
    try {
      if (ids.has(productId)) {
        const res = await api.delete(`/wishlist/${productId}`);
        setItems(unwrap(res) || []);
        toast.success('Removed from wishlist');
      } else {
        const res = await api.post(`/wishlist/${productId}`);
        setItems(unwrap(res) || []);
        toast.success('Added to wishlist');
      }
    } catch (e) {
      toast.error(apiError(e, 'Could not update wishlist'));
    }
  };

  return (
    <WishlistContext.Provider value={{ items, ids, loading, refresh, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
