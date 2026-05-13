import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Image as ImageIcon, Video, User } from "lucide-react";
import { Logo } from "./Logo";
import { loadThread, subscribeThreads, type Mode, type StoredMessage } from "@/lib/threadStore";

type Recent = StoredMessage & { mode: Mode };

function readRecents(): Recent[] {
  const all: Recent[] = [
    ...loadThread("image").map((m) => ({ ...m, mode: "image" as const })),
    ...loadThread("video").map((m) => ({ ...m, mode: "video" as const })),
  ];
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
}

/** Shared nav + recents for desktop sidebar and mobile sheet. */
export function AppSidebarNav({
  active,
  onNavigate,
}: {
  active: Mode;
  onNavigate?: () => void;
}) {
  const [recents, setRecents] = useState<Recent[]>([]);

  useEffect(() => {
    setRecents(readRecents());
    return subscribeThreads(() => setRecents(readRecents()));
  }, []);

  const close = () => onNavigate?.();

  return (
    <>
      <Link to="/" className="px-2" onClick={close}>
        <Logo />
      </Link>

      <nav className="mt-8 space-y-1">
        <Link
          to="/login"
          onClick={close}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            active === "image"
              ? "bg-caramel text-white font-medium"
              : "text-ink hover:bg-cream-deep"
          }`}
        >
          <ImageIcon className="h-4 w-4" /> Generate Image
        </Link>
        <Link
          to="/login"
          onClick={close}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            active === "video"
              ? "bg-caramel text-white font-medium"
              : "text-ink hover:bg-cream-deep"
          }`}
        >
          <Video className="h-4 w-4" /> Generate Video
        </Link>
      </nav>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
        <p className="px-3 font-mono text-[11px] uppercase tracking-wider text-warm-gray">
          Recent Generations
        </p>
        {recents.length === 0 ? (
          <p className="mt-3 px-3 text-xs text-warm-gray">Your generations will appear here.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recents.map((r) => (
              <Link
                key={r.id}
                to={r.mode === "video" ? "/generate-video" : "/generate-image"}
                onClick={close}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-xs text-warm-gray hover:bg-cream-deep transition-colors"
                title={r.prompt}
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                  <img
                    src={r.result || r.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="truncate">{r.prompt}</span>
              </Link>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5 shadow-surface-xs">
        <div className="h-8 w-8 rounded-full bg-mint flex items-center justify-center">
          <User className="h-4 w-4 text-ink" />
        </div>
        <div className="text-xs">
          <div className="font-medium text-ink">My Account</div>
          <div className="text-warm-gray">Free plan</div>
        </div>
      </div>
    </>
  );
}

export function AppSidebar({ active }: { active: Mode }) {
  return (
    <aside className="hidden h-full min-h-0 w-[240px] shrink-0 flex-col border-r border-border bg-cream px-4 py-6 md:flex">
      <AppSidebarNav active={active} />
    </aside>
  );
}
