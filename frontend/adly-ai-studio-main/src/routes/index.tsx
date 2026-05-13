import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, Sparkles, Download, Image as ImageIcon, Video, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import fashionShowcase from "@/assets/Fashion.png";
import skincareShowcase from "@/assets/Skincare.png";
import sneakersShowcase from "@/assets/Sneakers.png";
import bagsShowcase from "@/assets/Bags.png";
import kitchenShowcase from "@/assets/Kitchen-accesories.png";
import jewelryShowcase from "@/assets/Jewelry.png";
import electronicsShowcase from "@/assets/Electronics.png";
import sunglassesShowcase from "@/assets/Sunglasses.png";
import watchesShowcase from "@/assets/Watches.png";
import sareeShowcase from "@/assets/Saree.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adbee AI — Turn Products Into Stunning Ads, Instantly" },
      {
        name: "description",
        content:
          "Upload your product image, describe your vision, and let Adbee AI generate scroll-stopping ad images and videos in seconds.",
      },
      { property: "og:title", content: "Adbee AI — AI Ad Generator for Brands" },
      {
        property: "og:description",
        content: "Generate stunning product ads — images and videos — in seconds with Adbee AI.",
      },
    ],
  }),
  component: Landing,
});

const marquee = [
  { label: "Product Ad · Fashion", image: fashionShowcase },
  { label: "Product Ad · Skincare", image: skincareShowcase },
  { label: "Product Ad · Sneakers", image: sneakersShowcase },
  { label: "Product Ad · Bags", image: bagsShowcase },
  { label: "Product Ad · Kitchen", image: kitchenShowcase },
  { label: "Product Ad · Jewelry", image: jewelryShowcase },
  { label: "Product Ad · Electronics", image: electronicsShowcase },
  { label: "Product Ad · Sunglasses", image: sunglassesShowcase },
  { label: "Product Ad · Watches", image: watchesShowcase },
  { label: "Product Ad · Saree", image: sareeShowcase },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        to="/"
        className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream-deep md:px-0 md:py-0 md:text-sm md:hover:bg-transparent md:hover:text-warm-gray"
        onClick={() => setOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/login"
        className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream-deep md:px-0 md:py-0 md:text-sm md:hover:bg-transparent md:hover:text-warm-gray"
        onClick={() => setOpen(false)}
      >
        Generate Image
      </Link>
      <Link
        to="/login"
        className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream-deep md:px-0 md:py-0 md:text-sm md:hover:bg-transparent md:hover:text-warm-gray"
        onClick={() => setOpen(false)}
      >
        Generate Video
      </Link>
      <a
        href="#how"
        className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream-deep md:px-0 md:py-0 md:text-sm md:hover:bg-transparent md:hover:text-warm-gray"
        onClick={() => setOpen(false)}
      >
        How it works
      </a>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 shadow-header backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <Link to="/" className="-ml-1 shrink-0">
          <Logo imageClassName="h-7 max-w-[min(100%,11.2rem)] sm:h-8 sm:max-w-[min(100%,12.4rem)]" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink md:flex">{navLinks}</nav>
        <div className="flex shrink-0 items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn-press flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-cream md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-ink" />
            </button>
            <SheetContent
              side="right"
              className="w-[min(100%,320px)] border-l border-border bg-cream sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="text-left font-serif text-lg text-ink">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1 border-t border-border pt-4">{navLinks}</nav>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn-press mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
              >
                Get Started
              </Link>
            </SheetContent>
          </Sheet>
          <Link
            to="/login"
            className="btn-press inline-flex min-h-10 items-center rounded-full bg-ink px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black sm:px-5 sm:text-sm"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Get Started</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="hero-backdrop mx-auto max-w-5xl text-center">
          <span
            className="inline-block rounded-full border border-border/80 bg-white/80 px-4 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink shadow-surface-xs backdrop-blur-sm animate-fade-up"
            style={{ animationDelay: "0ms" }}
          >
            ✦ AI Ad Studio for Modern Brands
          </span>
          <h1
            className="mt-5 font-display text-[2rem] font-black leading-[1.08] text-ink sm:text-5xl md:mt-6 md:text-6xl lg:text-7xl animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            Turn Products Into <em className="font-display italic font-medium">Stunning Ads</em>
            <br /> — Instantly.
          </h1>
          <p
            className="mx-auto mt-5 max-w-2xl text-base text-warm-gray sm:mt-6 sm:text-lg md:text-xl animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            Upload your product image, describe your vision, and let ADly AI generate
            scroll-stopping advertising creatives in seconds.
          </p>
          <div
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center animate-fade-up"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              to="/login"
              className="btn-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-caramel px-6 py-3.5 font-medium text-white shadow-surface-sm transition-[color,background-color,box-shadow,transform] hover:bg-caramel-deep hover:shadow-surface-md"
            >
              Generate Image →
            </Link>
            <Link
              to="/login"
              className="btn-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-caramel px-6 py-3.5 font-medium text-white shadow-surface-sm transition-[color,background-color,box-shadow,transform] hover:bg-caramel-deep hover:shadow-surface-md"
            >
              Generate Video →
            </Link>
          </div>
          <p
            className="mt-6 text-sm text-warm-gray animate-fade-up"
            style={{ animationDelay: "480ms" }}
          >
            ✦ Loved by 10,000+ brands & creators
          </p>
        </div>
      </section>

      {/* Marquee */}
      <section className="marquee-pause overflow-hidden border-y border-border bg-cream-deep/90 py-4 sm:py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
        <div className="flex w-max animate-marquee gap-4">
          {[...marquee, ...marquee].map((item, i) => (
            <div
              key={i}
              className="flex h-40 w-40 shrink-0 flex-col justify-end rounded-2xl border border-border/90 bg-white/90 p-2.5 shadow-surface-xs backdrop-blur-sm sm:h-48 sm:w-48 sm:p-3"
            >
              <img
                src={item.image}
                alt={item.label}
                className="-mt-1 mb-2 min-h-0 flex-1 w-full rounded-xl border border-border/50 object-cover object-center"
                loading="lazy"
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-warm-gray">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-warm-gray">
              How it works
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl md:text-5xl">
              Ads in 3 simple steps
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3">
            {[
              {
                icon: <Upload className="h-5 w-5" />,
                title: "Upload Your Product",
                body: "Drop in any product photo. Our AI understands your product's shape, color, and identity.",
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "Describe Your Vision",
                body: "Write a prompt or leave it blank. ADly AI generates creative ad copy and scene suggestions automatically.",
              },
              {
                icon: <Download className="h-5 w-5" />,
                title: "Download & Launch",
                body: "Get your polished ad image or video ready to post on Instagram, Amazon, or anywhere.",
              },
            ].map((s, i) => (
              <div
                key={s.title}
                className="rounded-2xl border border-border bg-white p-6 shadow-surface-sm transition-lift sm:p-7"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-cream-deep text-ink shadow-surface-xs">
                  {s.icon}
                </div>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-warm-gray">
                  Step 0{i + 1}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-ink">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-warm-gray">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose format */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="font-mono text-[11px] uppercase tracking-wider text-warm-gray">
              Pick your format
            </span>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl md:text-5xl">
              What do you want to create?
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 md:grid-cols-2">
            <FormatCard
              bg="bg-blush"
              icon={<ImageIcon className="h-7 w-7" />}
              title="AI Ad Images"
              body="Perfect product shots, lifestyle scenes, and editorial layouts — generated from a single photo."
              to="/login"
            />
            <FormatCard
              bg="bg-powder"
              icon={<Video className="h-7 w-7" />}
              title="AI Ad Videos"
              body="Animated product showcases, UGC-style clips, and cinematic ads — no camera needed."
              to="/login"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-cream-deep/95 pb-[max(2rem,env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row">
          <Logo imageClassName="h-11 max-w-[min(100%,18rem)] sm:h-12 sm:max-w-[min(100%,20rem)]" />
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-ink">
            <Link to="/" className="transition-colors hover:text-warm-gray">
              Home
            </Link>
            <Link to="/login" className="transition-colors hover:text-warm-gray">
              Generate Image
            </Link>
            <Link to="/login" className="transition-colors hover:text-warm-gray">
              Generate Video
            </Link>
            <a href="#" className="transition-colors hover:text-warm-gray">
              Pricing
            </a>
          </nav>
          <p className="font-mono text-[11px] uppercase tracking-wider text-warm-gray">
            Made with ✦ for creators
          </p>
        </div>
      </footer>
    </div>
  );
}

function FormatCard({
  bg,
  icon,
  title,
  body,
  to,
}: {
  bg: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  to: string;
}) {
  return (
    <div
      className={`group flex flex-col justify-between rounded-3xl border border-ink/[0.06] ${bg} p-6 shadow-surface-sm transition-lift sm:p-8 md:p-10`}
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-white/95 text-ink shadow-surface-xs sm:h-14 sm:w-14">
          {icon}
        </div>
        <h3 className="mt-6 font-serif text-2xl text-ink sm:mt-8 sm:text-3xl md:text-4xl">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/80 sm:mt-4 sm:text-base">
          {body}
        </p>
      </div>
      <Link
        to={to}
        className="btn-press mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink/10 bg-white/95 px-5 py-3 text-sm font-medium text-ink shadow-surface-xs transition-[background-color,box-shadow,transform] hover:bg-white hover:shadow-surface-sm sm:mt-10 sm:w-fit"
      >
        Start Generating →
      </Link>
    </div>
  );
}
