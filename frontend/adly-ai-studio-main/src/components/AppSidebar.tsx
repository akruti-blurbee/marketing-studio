import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Image as ImageIcon, Video, User, Trash2 } from "lucide-react";
import { Logo } from "./Logo";
import { loadThread, loadHistory, subscribeThreads, deleteMessage, type Mode, type StoredMessage } from "@/lib/threadStore";
import { ImageLightbox } from "./ImageLightbox";

type Recent = StoredMessage & { mode: Mode };

function readRecents(): Recent[] {
  const all: Recent[] = [
    ...loadThread("image").map((m) => ({ ...m, mode: "image" as const })),
    ...loadThread("video").map((m) => ({ ...m, mode: "video" as const })),
    ...loadHistory("image").map((m) => ({ ...m, mode: "image" as const })),
    ...loadHistory("video").map((m) => ({ ...m, mode: "video" as const })),
  ];
  // Deduplicate by ID (active thread entries take priority)
  const seen = new Set<string>();
  const unique = all.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
  return unique.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
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
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    setRecents(readRecents());
    return subscribeThreads(() => setRecents(readRecents()));
  }, []);

  const close = () => onNavigate?.();

  const handleDelete = (e: React.MouseEvent, r: Recent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMessage(r.mode, r.id);
  };

  return (
    <>
      <Link to="/" className="px-2" onClick={close}>
        <Logo />
      </Link>

      <nav className="mt-8 space-y-1">
        <Link
          to="/generate-image"
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
          to="/generate-video"
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
              <li key={r.id} className="group relative">
                <button
                  type="button"
                  onClick={() => setLightbox({ src: r.result || r.imageUrl, alt: r.prompt })}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 pr-8 text-left text-xs text-warm-gray hover:bg-cream-deep transition-colors outline-none focus-visible:ring-2 ring-ink cursor-zoom-in"
                >
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-cream-deep">
                    <img
                      src={r.result || r.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="truncate flex-1" title={r.prompt}>
                    {r.prompt}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Delete generation"
                  onClick={(e) => handleDelete(e, r)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-warm-gray opacity-0 transition-all group-hover:opacity-100 hover:!text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
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

      <ImageLightbox
        open={lightbox !== null}
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        onClose={() => setLightbox(null)}
      />
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
