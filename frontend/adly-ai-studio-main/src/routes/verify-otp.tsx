import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const searchSchema = z.object({
  email: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (raw) => searchSchema.parse(raw),
  head: () => ({
    meta: [
      { title: "Verify email — ADly AI" },
      { name: "description", content: "Enter the verification code sent to your email." },
    ],
  }),
  component: VerifyOtpPage,
});

const otpSlotClass =
  "h-12 w-11 rounded-xl border border-border border-y border-l border-r bg-white text-base font-medium text-ink shadow-surface-xs first:rounded-xl first:border-l last:rounded-xl last:border-r";

function VerifyOtpPage() {
  const { email } = Route.useSearch();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (value.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }

    toast.success("Email verified (demo)", {
      description: "In production, validate the code on your server.",
    });
    navigate({ to: "/login" });
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
            containerClassName="gap-2 justify-center"
            aria-label="One-time password"
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
          className="btn-press h-11 w-full rounded-xl border border-transparent bg-caramel text-base font-semibold text-white shadow-surface-sm hover:bg-caramel-deep"
        >
          Verify & continue
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
            className="font-medium text-caramel underline-offset-4 hover:text-caramel-deep hover:underline"
            onClick={() =>
              toast.message("Resend code", { description: "Hook this up to your email provider." })
            }
          >
            Resend code
          </button>
        </p>
      </form>
    </AuthShell>
  );
}
