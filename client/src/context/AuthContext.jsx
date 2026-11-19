import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api.js';
import { tokenStore } from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(tokenStore.get()));

  // Restore the session from the stored token.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .fetchMe()
      .then((res) => setUser(res.data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setInitializing(false));
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const startSession = useCallback((res) => {
    tokenStore.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const login = useCallback((credentials) => authApi.loginUser(credentials).then(startSession), [startSession]);
  const register = useCallback((payload) => authApi.registerUser(payload).then(startSession), [startSession]);
  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, isAdmin: user?.role === 'Admin', isCustomer: user?.role === 'Customer', login, register, logout }),
    [user, initializing, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
