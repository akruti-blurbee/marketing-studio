import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, redirectToGoogleLogin } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ADbee AI" },
      { name: "description", content: "Create your ADbee AI account to generate ad creatives." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, authLoading, navigate]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await signUp({ email: trimmed, password, name: name.trim() || undefined });
      toast.success("Verification code sent!", {
        description: `Check your inbox at ${trimmed}.`,
      });
      navigate({ to: "/verify-otp", search: { email: trimmed } });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Sign up to start generating ad creatives">
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="signup-name" className="text-ink">
            Name <span className="text-warm-gray font-normal">(optional)</span>
          </Label>
          <Input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-xl border-border bg-white px-4 text-base shadow-surface-xs md:text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-ink">
            Email
          </Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password" className="text-ink">
            Create password
          </Label>
          <Input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 rounded-xl border-border bg-white px-4 text-base shadow-surface-xs md:text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-confirm" className="text-ink">
            Confirm password
          </Label>
          <Input
            id="signup-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
              Creating account…
            </span>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

      <div className="relative my-7">
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

      <p className="mt-8 text-center text-sm text-warm-gray">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-caramel underline-offset-4 hover:text-caramel-deep hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
