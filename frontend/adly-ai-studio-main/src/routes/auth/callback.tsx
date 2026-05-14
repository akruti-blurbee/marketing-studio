/**
 * /auth/callback — handles the redirect from Google OAuth.
 *
 * After Google → backend redirect, the backend sends:
 *   http://localhost:5173/auth/callback?token=<accessToken>
 *
 * This page reads the token, stores it in AuthContext, then navigates to the app.
 */

import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getMe } from "@/lib/auth";
import { setAccessToken, ApiError } from "@/lib/api";

const searchSchema = z.object({
  token: z.string().optional().catch(undefined),
  error: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (raw) => searchSchema.parse(raw),
  head: () => ({
    meta: [{ title: "Signing in… — ADly AI" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { token, error: oauthError } = Route.useSearch();
  const navigate = useNavigate();
  const { login } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (oauthError) {
      toast.error("Google sign-in failed. Please try again.");
      navigate({ to: "/login" });
      return;
    }

    if (!token) {
      toast.error("Authentication failed: no token received.");
      navigate({ to: "/login" });
      return;
    }

    // Store the access token then fetch the user profile
    (async () => {
      try {
        setAccessToken(token);
        const { user } = await getMe();
        login(token, user);
        toast.success(`Welcome, ${user.name || user.email}! 🎉`);
        navigate({ to: "/generate-image" });
      } catch (err) {
        setAccessToken(null);
        const msg = err instanceof ApiError ? err.message : "Sign-in failed.";
        toast.error(msg);
        navigate({ to: "/login" });
      }
    })();
  }, [token, oauthError, login, navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-caramel" />
      <p className="text-sm text-warm-gray font-mono">Signing you in…</p>
    </div>
  );
}
