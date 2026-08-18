import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { apiError, getTokens, setTokens, unwrap } from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/user');
      setUser(unwrap(res));
    } catch {
      setTokens(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    const onLogout = () => setUser(null);
    window.addEventListener('toko:logout', onLogout);
    return () => window.removeEventListener('toko:logout', onLogout);
  }, [loadProfile]);

  const applyAuthResult = (data) => {
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    setUser(data.user);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const data = unwrap(res);
    applyAuthResult(data);
    return data;
  };

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    const data = unwrap(res);
    applyAuthResult(data);
    return data;
  };

  const loginWithGoogle = async (idToken) => {
    const res = await api.post('/auth/google', { idToken });
    const data = unwrap(res);
    applyAuthResult(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', { mode: 'ONLY' });
    } catch {
      /* proceed with local logout regardless */
    } finally {
      setTokens(null);
      setUser(null);
    }
  };

  const confirmEmail = async (email, otp) => {
    await api.post('/auth/confirm-email', { email, otp });
  };

  const forgotPassword = async (email) => {
    await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (email, token, newPassword) => {
    await api.post('/auth/reset-password', { email, token, newPassword });
  };

  const changePassword = async (payload) => {
    await api.patch('/user/password', payload);
  };

  const refreshProfile = loadProfile;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        signup,
        loginWithGoogle,
        logout,
        confirmEmail,
        forgotPassword,
        resetPassword,
        changePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function handleAuthError(error, fallback) {
  toast.error(apiError(error, fallback));
}
