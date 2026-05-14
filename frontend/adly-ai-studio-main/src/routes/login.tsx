import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { redirectToGoogleLogin } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — ADly AI" },
      { name: "description", content: "Log in to ADly AI to generate ad creatives." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      await loginWithCredentials(trimmed, password);
      toast.success("Welcome back! 👋");
      navigate({ to: "/generate-image" });
    } catch (err) {
      if (err instanceof ApiError) {
        // Unverified account — redirect to OTP page
        if (err.code === "UNVERIFIED") {
          toast.info("Check your email for a verification code.");
          navigate({ to: "/verify-otp", search: { email: trimmed } });
          return;
        }
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  void login; // used via loginWithCredentials inside context

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue creating stunning ads">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-ink">
            Email
          </Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-xl border-border bg-white px-4 text-base shadow-surface-xs md:text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="login-password" className="text-ink">
              Password
            </Label>
            <button
              type="button"
              className="text-xs font-medium text-caramel hover:text-caramel-deep hover:underline"
              onClick={() =>
                toast.message("Reset password", {
                  description: "Password reset flow coming soon.",
                })
              }
            >
              Forgot?
            </button>
          </div>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-xl border-border bg-white px-4 text-base shadow-surface-xs md:text-sm"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="outline"
          disabled={isLoading}
          className="btn-press h-11 w-full rounded-xl border-ink/20 bg-white text-base font-semibold text-ink shadow-surface-xs hover:bg-cream-deep/40 disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Logging in…
            </span>
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-white px-3 font-mono text-warm-gray">or</span>
        </div>
      </div>

      <GoogleAuthButton
        label="Continue with Google"
        onClick={redirectToGoogleLogin}
      />

      <p className="mt-6 text-center text-sm text-warm-gray">
        New here?{" "}
        <Link
          to="/signup"
          className="font-medium text-caramel underline-offset-4 hover:text-caramel-deep hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
