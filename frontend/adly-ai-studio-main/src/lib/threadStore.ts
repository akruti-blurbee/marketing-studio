// Persistent storage for ADly AI generation threads.
// Stored per-mode in localStorage so users can revisit prior generations.

export type StoredMessage = {
  id: string;
  imageUrl: string; // data URL (persisted)
  prompt: string;
  result?: string;
  loading?: boolean;
  createdAt: number;
};

export type Mode = "image" | "video";

const KEY = (mode: Mode) => `adly:thread:${mode}`;
const EVENT = "adly:thread-change";

export function loadThread(mode: Mode): StoredMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY(mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredMessage[];
    // Drop any in-flight loading entries from a previous session.
    return parsed.filter((m) => !m.loading);
  } catch {
    return [];
  }
}

export function saveThread(mode: Mode, messages: StoredMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(mode), JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    /* quota or serialization errors — ignore */
  }
}

export function subscribeThreads(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reconstruct a File from a persisted data URL (e.g. regenerate with the same product image). */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}
