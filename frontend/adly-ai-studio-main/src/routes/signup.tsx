import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ADly AI" },
      { name: "description", content: "Create your ADly AI account to generate ad creatives." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
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

    navigate({
      to: "/verify-otp",
      search: { email: trimmed },
    });
  }

  return (
    <AuthShell title="Create your account" subtitle="Sign up to start generating ad creatives">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
          className="btn-press h-11 w-full rounded-xl border-ink/20 bg-white text-base font-semibold text-ink shadow-surface-xs hover:bg-cream-deep/40"
        >
          Sign up
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
        onClick={() =>
          toast.message("Google sign-in", { description: "Connect your backend to enable OAuth." })
        }
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
