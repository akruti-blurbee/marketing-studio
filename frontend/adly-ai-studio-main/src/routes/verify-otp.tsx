import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/context/AuthContext";
import { verifyOtp, resendOtp } from "@/lib/auth";
import { ApiError } from "@/lib/api";

const searchSchema = z.object({
  email: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (raw) => searchSchema.parse(raw),
  head: () => ({
    meta: [
      { title: "Verify email — ADbee AI" },
      { name: "description", content: "Enter the verification code sent to your email." },
    ],
  }),
  component: VerifyOtpPage,
});

const otpSlotClass =
  "h-11 w-10 rounded-xl border border-border border-y border-l border-r bg-white text-sm font-medium text-ink shadow-surface-xs first:rounded-xl first:border-l last:rounded-xl last:border-r sm:h-12 sm:w-11 sm:text-base";

function VerifyOtpPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("No email found. Please go back and sign up again.");
      return;
    }
    if (value.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifyOtp({ email, code: value });
      login(data.accessToken, data.user);
      toast.success("Email verified! Welcome to ADbee AI 🎉");
      navigate({ to: "/" });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Verification failed. Please try again.");
      }
      setValue("");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    setError(null);
    try {
      await resendOtp(email);
      toast.success("Code resent!", { description: `Check your inbox at ${email}.` });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell
      title="Check your inbox"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}`
          : "Enter the 6-digit code we sent to your email"
      }
    >
      <form className="space-y-6" onSubmit={handleVerify}>
        <div className="flex flex-col items-center gap-2">
          <InputOTP
            maxLength={6}
            value={value}
            onChange={(v) => {
              setValue(v);
              setError(null);
            }}
            onComplete={() => {
              setError(null);
              submitRef.current?.focus();
            }}
            containerClassName="justify-center gap-1.5 sm:gap-2"
            aria-label="One-time password"
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className={otpSlotClass} />
              <InputOTPSlot index={1} className={otpSlotClass} />
              <InputOTPSlot index={2} className={otpSlotClass} />
              <InputOTPSlot index={3} className={otpSlotClass} />
              <InputOTPSlot index={4} className={otpSlotClass} />
              <InputOTPSlot index={5} className={otpSlotClass} />
            </InputOTPGroup>
          </InputOTP>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <Button
          ref={submitRef}
          type="submit"
          disabled={isLoading || value.length !== 6}
          className="btn-press h-11 w-full rounded-xl border border-transparent bg-caramel text-base font-semibold text-white shadow-surface-sm hover:bg-caramel-deep disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </span>
          ) : (
            "Verify & continue"
          )}
        </Button>

        <p className="text-center text-sm text-warm-gray">
          Wrong email?{" "}
          <Link
            to="/signup"
            className="font-medium text-caramel underline-offset-4 hover:text-caramel-deep hover:underline"
          >
            Go back
          </Link>
          {" · "}
          <button
            type="button"
            disabled={isResending}
            className="font-medium text-caramel underline-offset-4 hover:text-caramel-deep hover:underline disabled:opacity-50"
            onClick={handleResend}
          >
            {isResending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
