/**
 * AuthContext — global authentication state.
 *
 * On mount: calls /auth/refresh to hydrate session from httpOnly refresh cookie.
 * Provides: user, isAuthenticated, isLoading, login(), logout().
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { setAccessToken } from "@/lib/api";
import {
  logIn as apiLogIn,
  logOut as apiLogOut,
  refreshToken as apiRefresh,
  type AuthUser,
} from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Call after a successful API login to hydrate context */
  login: (token: string, user: AuthUser) => void;
  /** Perform API login (email + password) */
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  /** Clear context and call logout API */
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  // On mount — try to restore session via refresh cookie
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      try {
        const data = await apiRefresh();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No active session — this is expected when the user is logged out
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /** Hydrate context from an already-successful auth response */
  const login = useCallback((token: string, authUser: AuthUser) => {
    setAccessToken(token);
    setUser(authUser);
  }, []);

  /** Perform credentials login, then hydrate context */
  const loginWithCredentials = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogIn({ email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
    []
  );

  /** Clear session */
  const logout = useCallback(async () => {
    try {
      await apiLogOut();
    } catch {
      // Ignore errors — still clear local state
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}
