import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  X,
  Download,
  RefreshCw,
  Pencil,
  Play,
  Trash2,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { AppSidebar, AppSidebarNav } from "./AppSidebar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  dataUrlToFile,
  fileToDataUrl,
  loadThread,
  saveThread,
  deleteMessage,
  archiveThread,
  type StoredMessage,
} from "@/lib/threadStore";
import { generateAdImage, resultToDataUrl } from "@/lib/generateImageApi";

type Mode = "image" | "video";

type Message = StoredMessage;

const DEFAULT_PROMPT_LABEL = "Auto-generated ad scene";

/** crypto.randomUUID() is only available in secure contexts (HTTPS/localhost).
 *  This helper falls back to a manual UUID v4 so the app works over plain HTTP. */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Manual UUID v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const samples = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=70",
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=70",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=70",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=70",
];

export function GenerateWorkspace({ mode }: { mode: Mode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [upload, setUpload] = useState<string | null>(null);
  const [videoStyle, setVideoStyle] = useState<"Cinematic" | "UGC Style" | "Product Showcase">(
    "Cinematic",
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  /** Original file for the current preview (data URLs alone cannot be sent to the API). */
  const pendingFileRef = useRef<File | null>(null);

  const isVideo = mode === "video";

  // Archive completed generations to history, then start a fresh chat on mount/mode-switch.
  useEffect(() => {
    archiveThread(mode);
    // Clear the active thread so the chat starts fresh
    saveThread(mode, []);
    setMessages([]);
  }, [mode]);

  // Persist on every change. Skip writing while a message is loading so we
  // don't store transient state — the result handler triggers a final save.
  useEffect(() => {
    if (messages.some((m) => m.loading)) return;
    saveThread(mode, messages);
    // Also archive completed messages to history so they appear in sidebar
    archiveThread(mode);
  }, [mode, messages]);

  // Auto-scroll to newest message.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const onFile = async (f?: File) => {
    if (!f) return;
    pendingFileRef.current = f;
    const dataUrl = await fileToDataUrl(f);
    setUpload(dataUrl);
  };

  const handleGenerate = () => {
    if (!upload) {
      fileRef.current?.click();
      return;
    }
    if (isVideo) {
      runVideoMockGeneration();
      return;
    }
    const file = pendingFileRef.current;
    if (!file) {
      toast.error("Please re-upload your product image to generate.");
      return;
    }
    void runImageGeneration(file);
  };

  const runVideoMockGeneration = () => {
    const id = generateId();
    const msg: Message = {
      id,
      imageUrl: upload!,
      prompt: prompt || "Auto-generated cinematic ad scene",
      loading: true,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    setPrompt("");
    setUpload(null);
    pendingFileRef.current = null;

    setTimeout(() => {
      setMessages((m) =>
        m.map((x) =>
          x.id === id
            ? { ...x, loading: false, result: samples[Math.floor(Math.random() * samples.length)] }
            : x,
        ),
      );
    }, 3000);
  };

  const runImageGeneration = async (file: File) => {
    const previewUrl = upload!;
    const userPrompt = prompt.trim();
    const id = generateId();
    const msg: Message = {
      id,
      imageUrl: previewUrl,
      prompt: userPrompt || DEFAULT_PROMPT_LABEL,
      loading: true,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    setPrompt("");
    setUpload(null);
    pendingFileRef.current = null;

    try {
      const apiResult = await generateAdImage(file, { prompt: userPrompt });
      const resultUrl = resultToDataUrl(apiResult);
      setMessages((m) =>
        m.map((x) => (x.id === id ? { ...x, loading: false, result: resultUrl } : x)),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generation failed";
      toast.error(message);
      setMessages((m) => m.filter((x) => x.id !== id));
    }
  };

  const regenerateMessage = async (m: Message) => {
    if (m.loading || !m.result) return;

    if (isVideo) {
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, loading: true } : x)),
      );
      window.setTimeout(() => {
        setMessages((prev) =>
          prev.map((x) =>
            x.id === m.id
              ? {
                  ...x,
                  loading: false,
                  result: samples[Math.floor(Math.random() * samples.length)],
                }
              : x,
          ),
        );
      }, 3000);
      return;
    }

    const apiPrompt = m.prompt === DEFAULT_PROMPT_LABEL ? "" : m.prompt;
    setMessages((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, loading: true } : x)),
    );
    try {
      const file = await dataUrlToFile(m.imageUrl, `product-${m.id.slice(0, 8)}.png`);
      const apiResult = await generateAdImage(file, { prompt: apiPrompt });
      const resultUrl = resultToDataUrl(apiResult);
      setMessages((prev) =>
        prev.map((x) =>
          x.id === m.id ? { ...x, loading: false, result: resultUrl } : x,
        ),
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generation failed";
      toast.error(message);
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, loading: false } : x)),
      );
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    deleteMessage(mode, messageId);
    toast.success("Generation deleted");
  };

  const clearThread = () => {
    if (messages.length === 0) return;
    if (confirm("Clear all generations in this thread?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 overflow-hidden bg-background">
      <AppSidebar active={mode} />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-[min(100%,280px)] border-r border-border bg-cream p-0 sm:max-w-[280px]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>App navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full min-h-0 flex-col overflow-hidden px-4 py-6 pt-14">
            <AppSidebarNav active={mode} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-cream/95 px-4 py-3 shadow-header backdrop-blur-sm sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="btn-press flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-ink md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="min-w-0 truncate font-serif text-xl text-ink sm:text-2xl">
              {isVideo ? "Generate Video" : "Generate Image"}
            </h1>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-start sm:gap-3">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearThread}
                className="btn-press flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-ink transition-colors hover:bg-cream-deep"
              >
                <Trash2 className="h-3.5 w-3.5" />{" "}
                <span className="hidden sm:inline">Clear thread</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
            <span
              className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink sm:px-3 sm:text-[11px] ${
                isVideo ? "bg-powder" : "bg-mint"
              }`}
            >
              <span className="hidden sm:inline">ADbee AI · </span>
              {isVideo ? "Video" : "Image"}
            </span>
          </div>
        </header>

        {/* Thread */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 ? (
              <EmptyState isVideo={isVideo} />
            ) : (
              <div className="space-y-6">
                {messages.map((m) => (
                  <ThreadItem
                    key={m.id}
                    m={m}
                    isVideo={isVideo}
                    onRegenerate={() => void regenerateMessage(m)}
                    onDelete={() => handleDeleteMessage(m.id)}
                  />
                ))}
                <div ref={threadEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 border-t border-border bg-cream px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5">
          <div className="mx-auto max-w-3xl">
            {isVideo && (
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="shrink-0 font-mono uppercase tracking-wider text-warm-gray">
                  Style:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["Cinematic", "UGC Style", "Product Showcase"] as const).map((s) => {
                    const active = videoStyle === s;
                    const bg =
                      s === "Cinematic" ? "bg-blush" : s === "UGC Style" ? "bg-cream-deep" : "bg-powder";
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setVideoStyle(s)}
                        className={`min-h-9 rounded-full px-3 py-1.5 transition-colors ${
                          active ? `${bg} text-ink` : "bg-white text-warm-gray hover:bg-cream-deep"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-white p-3 shadow-surface-sm sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0])}
                />

                <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
                  {upload ? (
                    <div className="relative shrink-0">
                      <img
                        src={upload}
                        alt="upload preview"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          pendingFileRef.current = null;
                          setUpload(null);
                        }}
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="btn-press flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-caramel px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-caramel-deep sm:w-auto sm:justify-start"
                    >
                      <Upload className="h-4 w-4 shrink-0" />{" "}
                      <span className="truncate">Upload product image</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Describe your ad… (optional)"
                  className="appearance-none min-h-11 w-full flex-1 rounded-lg border-none bg-cream-deep/50 px-3 py-2 text-sm text-ink placeholder:text-warm-gray outline-none focus:outline-none focus:ring-0 shadow-none sm:min-h-0 sm:bg-transparent sm:px-0 sm:py-0"
                  enterKeyHint="send"
                />

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn-press flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 shrink-0" />
                  {isVideo ? "Generate video" : "Generate"}
                </button>
              </div>
              <p className="mt-3 hidden text-[11px] leading-snug text-warm-gray sm:block sm:text-xs">
                Optional: e.g. luxury skincare flat lay on marble, morning light
              </p>
            </div>

            <p className="mt-2 text-center text-xs text-warm-gray">
              ✦ Prompt is optional — ADbee AI will auto-generate an ad scene from your product.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ isVideo }: { isVideo: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in sm:py-20">
      <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-cream-deep sm:h-40 sm:w-40">
        <Sparkles className="h-8 w-8 text-warm-gray sm:h-10 sm:w-10" strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 px-2 font-serif text-xl leading-snug text-ink sm:mt-6 sm:px-0 sm:text-2xl">
        {isVideo
          ? "Upload a product image to generate a video ad"
          : "Upload a product image to get started"}
      </h2>
      <p className="mt-2 text-sm text-warm-gray">Your generated ads will appear here</p>
    </div>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.rel = "noopener";
  a.click();
}

function ImageLightbox({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="btn-press absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close full screen image"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[min(92vh,100%)] max-w-[min(92vw,100%)] rounded-lg object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ThreadItem({
  m,
  isVideo,
  onRegenerate,
  onDelete,
}: {
  m: Message;
  isVideo: boolean;
  onRegenerate: () => void;
  onDelete: () => void;
}) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <div className="space-y-4 animate-bubble">
      {/* User bubble */}
      <div className="flex justify-end">
        <div className="w-full max-w-[min(100%,20rem)] rounded-2xl rounded-br-md bg-blush p-3 sm:max-w-md">
          <button
            type="button"
            onClick={() => setLightbox({ src: m.imageUrl, alt: "Uploaded product" })}
            className="block w-full cursor-zoom-in rounded-xl text-left outline-none ring-ink focus-visible:ring-2"
          >
            <img src={m.imageUrl} alt="" className="h-32 w-full rounded-xl object-cover" />
          </button>
          <p className="mt-2 px-1 text-sm text-ink">{m.prompt}</p>
        </div>
      </div>

      {/* AI response */}
      <div className="flex justify-start">
        {m.loading ? (
          <div className="w-full max-w-full space-y-3 sm:max-w-sm">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-2 w-2 rounded-full bg-caramel dot" style={{ animationDelay: "0s" }} />
              <span
                className="h-2 w-2 rounded-full bg-caramel dot"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="h-2 w-2 rounded-full bg-caramel dot"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <div className="rounded-2xl border border-border bg-white p-3 shadow-surface-sm">
              <div className="aspect-[4/3] w-full rounded-xl skeleton" />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-full rounded-2xl border border-border bg-white p-3 shadow-surface-sm sm:max-w-sm">
            <div
              role="button"
              tabIndex={0}
              aria-label="View full size"
              className="relative cursor-zoom-in overflow-hidden rounded-xl outline-none ring-ink focus-visible:ring-2"
              onClick={() => m.result && setLightbox({ src: m.result, alt: "Generated ad" })}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && m.result) {
                  e.preventDefault();
                  setLightbox({ src: m.result, alt: "Generated ad" });
                }
              }}
            >
              <img
                src={m.result}
                alt="generated ad"
                className={`w-full ${isVideo ? "aspect-video object-cover" : "h-auto object-contain rounded-xl"}`}
              />
              {isVideo && (
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20"
                  aria-hidden
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                    <Play className="h-6 w-6 text-ink" fill="currentColor" />
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionBtn
                icon={<Download className="h-3.5 w-3.5" />}
                onClick={() => {
                  if (!m.result) return;
                  const ext = isVideo ? "mp4" : "png";
                  downloadDataUrl(m.result, `adbee-generated-${m.id.slice(0, 8)}.${ext}`);
                }}
              >
                Download {isVideo ? "MP4" : "PNG"}
              </ActionBtn>
              <ActionBtn icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={onRegenerate}>
                Regenerate
              </ActionBtn>
              <ActionBtn icon={<Pencil className="h-3.5 w-3.5" />}>Edit Prompt</ActionBtn>

            </div>
          </div>
        )}
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

function ActionBtn({
  children,
  icon,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}) {
  const isDanger = variant === "danger";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-press flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
        isDanger
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-border bg-cream text-ink hover:bg-cream-deep"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
