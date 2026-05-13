import { Link } from "@tanstack/react-router";
import { Image as ImageIcon } from "lucide-react";

import authBackground from "@/assets/Gemini_Generated_Image_aqatfjaqatfjaqat.png";
import { Logo } from "@/components/Logo";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-cream px-4 pt-2 pb-3 sm:px-6 sm:pb-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-cream bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      />

      <header className="relative z-10 mx-auto mb-3 flex w-full max-w-5xl shrink-0 items-center justify-between sm:mb-4">
        <Link to="/" className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>
        <Link
          to="/"
          className="text-sm font-medium text-warm-gray underline-offset-4 transition-colors hover:text-ink"
        >
          Back to home
        </Link>
      </header>

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center overflow-y-auto overscroll-y-contain py-1 [-webkit-overflow-scrolling:touch]">
        <div className="my-auto w-full max-w-[420px] shrink-0 py-1">
          <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-surface-md sm:p-8">
            <div className="mb-2 flex justify-center xl:hidden" aria-hidden>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-cream-deep text-caramel shadow-surface-xs">
                <ImageIcon className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-center font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-2 text-center text-sm text-warm-gray">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
