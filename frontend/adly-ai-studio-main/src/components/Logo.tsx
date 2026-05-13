import { Sparkle } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-ink/10 bg-ink text-white shadow-surface-sm">
        <Sparkle className="h-4 w-4 absolute" strokeWidth={2.5} />
        <span className="font-display font-black text-[15px] leading-none mt-[1px]">A</span>
      </div>
      <span className="font-sans text-[18px] tracking-tight">
        <span className="font-bold text-ink">ADly</span>{" "}
        <span className="font-light text-warm-gray">AI</span>
      </span>
    </div>
  );
}
