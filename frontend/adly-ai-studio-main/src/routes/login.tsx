import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
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

    toast.success("Demo only", {
      description: "Wire this form to your auth API when the backend is ready.",
    });
  }

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
                  description: "Add a reset flow when backend is ready.",
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
          Log in
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
        onClick={() =>
          toast.message("Google sign-in", { description: "Connect your backend to enable OAuth." })
        }
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
