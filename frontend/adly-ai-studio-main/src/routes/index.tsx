import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Upload, Sparkles, Download, Image as ImageIcon, Video, Menu, User, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const generateImageTo = isAuthenticated ? "/generate-image" : "/login";
  const generateVideoTo = isAuthenticated ? "/generate-video" : "/login";

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
        to={generateImageTo}
        className="rounded-lg px-3 py-3 text-base text-ink hover:bg-cream-deep md:px-0 md:py-0 md:text-sm md:hover:bg-transparent md:hover:text-warm-gray"
        onClick={() => setOpen(false)}
      >
        Generate Image
      </Link>
      <Link
        to={generateVideoTo}
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
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-press mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
                >
                  Get Started
                </Link>
              ) : (
                <button
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="btn-press mt-6 flex min-h-11 w-full items-center justify-center rounded-full border border-ink/20 bg-transparent px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  Log out
                </button>
              )}
            </SheetContent>
          </Sheet>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-cream transition-colors hover:bg-cream-deep focus:outline-none">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-transparent text-ink">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && <p className="font-medium text-ink">{user.name}</p>}
                    {user?.email && <p className="w-[150px] truncate text-sm text-warm-gray">{user.email}</p>}
                  </div>
                </div>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="btn-press inline-flex min-h-10 items-center rounded-full bg-ink px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">Start</span>
              <span className="hidden sm:inline">Get Started</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Landing() {
  const { isAuthenticated } = useAuth();
  const generateImageTo = isAuthenticated ? "/generate-image" : "/login";
  const generateVideoTo = isAuthenticated ? "/generate-video" : "/login";

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
            Upload your product image, describe your vision, and let ADbee AI generate
            scroll-stopping advertising creatives in seconds.
            <span className="mt-2 block font-medium text-ink">
              --Create your whole catalog from a single platform--
            </span>
          </p>
          <div
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center animate-fade-up"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              to={generateImageTo}
              className="btn-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ink/10 bg-caramel px-6 py-3.5 font-medium text-white shadow-surface-sm transition-[color,background-color,box-shadow,transform] hover:bg-caramel-deep hover:shadow-surface-md"
            >
              Generate Image →
            </Link>
            <Link
              to={generateVideoTo}
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
                body: "Write a prompt or leave it blank. ADbee AI generates creative ad copy and scene suggestions automatically.",
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
              to={generateImageTo}
            />
            <FormatCard
              bg="bg-powder"
              icon={<Video className="h-7 w-7" />}
              title="AI Ad Videos"
              body="Animated product showcases, UGC-style clips, and cinematic ads — no camera needed."
              to={generateVideoTo}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-cream-deep/95 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
            {/* Brand Column */}
            <div className="flex flex-col gap-4 md:col-span-2">
              <Link to="/" className="-ml-1">
                <Logo imageClassName="h-10 max-w-[min(100%,16rem)] sm:h-11" />
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-warm-gray">
                Turn your products into scroll-stopping advertising creatives instantly. 
                The AI-powered studio for modern brands and creators.
              </p>
            </div>

            {/* Links Columns */}
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">Product</h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-warm-gray">
                <li>
                  <Link to={generateImageTo} className="transition-colors hover:text-ink">
                    Generate Image
                  </Link>
                </li>
                <li>
                  <Link to={generateVideoTo} className="transition-colors hover:text-ink">
                    Generate Video
                  </Link>
                </li>
                <li>
                  <a href="#how" className="transition-colors hover:text-ink">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-ink">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-medium text-ink">Resources</h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-warm-gray">
                <li>
                  <a href="#" className="transition-colors hover:text-ink">Help Center</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-ink">Blog</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-ink">Prompt Guide</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-lg font-medium text-ink">Company</h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-warm-gray">
                <li>
                  <a href="#" className="transition-colors hover:text-ink">About Us</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-ink">Contact</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-ink">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-ink">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 pb-4 md:flex-row">
            <div className="flex flex-col items-center gap-1.5 md:items-start">
              <p className="text-sm text-warm-gray">
                &copy; {new Date().getFullYear()} Adbee. All rights reserved.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-warm-gray/80">
                Made with ✦ by Blurbee Solutions
              </p>
            </div>
            
            {/* Socials */}
            <div className="flex gap-4">
              <a href="#" className="text-warm-gray transition-colors hover:text-ink" aria-label="Twitter">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-warm-gray transition-colors hover:text-ink" aria-label="Instagram">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-warm-gray transition-colors hover:text-ink" aria-label="LinkedIn">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
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
