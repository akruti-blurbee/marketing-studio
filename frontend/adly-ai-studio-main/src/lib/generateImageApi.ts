const defaultBase = "http://127.0.0.1:8000";

export function getApiBaseUrl(): string {
  const v = import.meta.env.VITE_API_BASE_URL;
  if (typeof v === "string" && v.trim()) return v.replace(/\/$/, "");
  // Dev server (@lovable.dev/vite-tanstack-config) defaults to port 8080; same-origin
  // `/api` is proxied in vite.config.ts so we avoid CORS on any dev port.
  if (import.meta.env.DEV) return "";
  return defaultBase;
}

export type GenerateImageApiResult = {
  image_base64: string;
  mime_type: string;
  flux_prompt: string;
};

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const j: unknown = await res.json();
    if (j && typeof j === "object" && "detail" in j) {
      const d = (j as { detail: unknown }).detail;
      if (typeof d === "string") return d;
      if (Array.isArray(d)) {
        return d
          .map((x) => {
            if (x && typeof x === "object" && "msg" in x) return String((x as { msg: unknown }).msg);
            return JSON.stringify(x);
          })
          .join("; ");
      }
    }
  } catch {
    /* ignore */
  }
  return res.statusText || `HTTP ${res.status}`;
}

/**
 * Product image → FLUX ad image (backend runs Gemini expansion unless skipGemini).
 */
export async function generateAdImage(
  file: File,
  options?: { prompt?: string; skipGemini?: boolean },
): Promise<GenerateImageApiResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("prompt", options?.prompt ?? "");
  fd.append("skip_gemini", options?.skipGemini ? "true" : "false");

  const res = await fetch(`${getApiBaseUrl()}/api/generate-image`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error(await readErrorDetail(res));
  }

  return res.json() as Promise<GenerateImageApiResult>;
}

export function resultToDataUrl(r: GenerateImageApiResult): string {
  return `data:${r.mime_type};base64,${r.image_base64}`;
}
