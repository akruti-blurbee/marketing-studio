"""Shared FLUX image-to-image pipeline (Gemini prompt expansion + Hugging Face)."""

from __future__ import annotations

import io
import os
import re
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types
from huggingface_hub import InferenceClient
from PIL import Image

MODEL_ID = "black-forest-labs/FLUX.2-klein-9B"
GEMINI_MODEL_ID = "gemini-2.5-flash"

FLUX_PROMPT_BUILDER = """\
You are a senior creative director and prompt engineer writing prompts for open-source \
image-to-image diffusion models (FLUX / SDXL family).

The downstream model is FLUX.2 (image-to-image). It receives the SAME product reference \
image the user attached, plus YOUR text as the only instruction. It has NO system prompt, \
no chat history, and no ability to ask clarifying questions — every visual decision must \
be spelled out in this single prompt. Open-source diffusion models do NOT reason; they \
pattern-match on concrete, photography-style vocabulary. Vague art-direction language \
("elegant", "premium feel", "tells a story") is mostly ignored — replace it with \
specific, observable visual facts.

Non-negotiable: the OUTPUT must describe the EXACT SAME product identity as the \
reference image — same SKU, pack type, silhouette, proportions, materials, colors, \
label layout, every word of on-pack text and logos, and cap or closure. You may ONLY \
change scene, lighting, camera, props, and (if chosen) people or hands; never redesign, \
rebrand, genericize, or substitute a different product.

Your task:
1. Carefully read the product image. Identify and lock down: product category, exact \
shape and silhouette, materials (glass, frosted glass, matte plastic, aluminum, paper, \
fabric…), surface finish (glossy, matte, satin, brushed), dominant + accent colors \
(name them), label layout, every word of visible brand text / logo, cap or closure \
style, and any distinguishing details (texture, embossing, droplets, ridges).
2. Combine that with the user's brief (product label, marketing purpose, audience, \
creative direction). If the brief is empty, infer a tasteful default scene that suits \
the product category. Before you write the final prompt, decide whether this product \
and typical commercial photography for it should include a human (or hands only) or \
stay a pure product hero with no people: favor people when the category benefits from \
demonstration, wear, application, or emotional lifestyle context (e.g. skincare, \
fragrance, cosmetics, apparel, jewelry, eyewear, beverages consumed in-scene); favor \
no people when the pack or object alone is the hero and a model would distract \
(e.g. supplements, canned or boxed pantry goods, small electronics packaging, tools, \
industrial parts) unless the brief clearly calls for a lifestyle or model shot. If \
the brief explicitly requests or forbids people, follow the brief.
3. Write ONE single-paragraph English prompt (roughly 120–220 words, no line breaks) \
that FLUX can render directly.

Required content, in roughly this order, written as flowing prose (NOT a bulleted list):
  a. Shot type and subject lock-in — e.g. "Professional advertising product photograph \
of <exact product description from the image>, the same product identity as the \
reference in every respect: identical shape, silhouette, proportions, materials, label \
placement, label text, logo, typography, barcodes if visible, and color; preserve \
every word and glyph on the pack exactly as shown; do not alter or invent branding."
  b. Scene / environment — concrete setting with named surfaces and props \
(e.g. "resting on a wet, sunlit pebble beach with shallow turquoise water lapping at \
the base", or "on a polished travertine countertop beside a sprig of fresh rosemary \
and a halved lemon"). Name 2–4 supporting props that reinforce the product story \
without crowding it.
  c. Lighting — specify direction, quality, and color temperature \
(e.g. "soft directional key light from the upper left at ~45°, large softbox quality, \
warm 5200K, with a subtle silver fill on the right and a gentle rim light separating \
the bottle from the background"). Mention highlights and shadow softness.
  d. Camera and lens language — e.g. "shot on a full-frame DSLR with an 85mm f/2.8 \
macro lens, eye-level to the product, shallow depth of field, crisp focus on the label, \
creamy bokeh background, slight forward tilt".
  e. Composition — rule of thirds or centered hero, negative space for ad copy \
(say which side), framing tightness, and any leading lines.
  f. Color palette and mood — 3–5 named colors plus the emotional register \
("sun-bleached coastal palette: aqua, sand, warm white, pale coral; mood: clean, \
refreshing, energetic").
  g. Material and surface cues — how light should interact with the product's actual \
materials (e.g. "soft specular highlights on glass, condensation droplets clinging to \
the cold surface, label paper showing fine fiber texture").
  h. People — apply your decision from step 2. If the shot should include a person \
or hands, describe ethnicity, age range, wardrobe, expression, and how they interact \
with the product; explicitly require "anatomically correct hands with five fingers, \
natural facial proportions, realistic skin texture". If the shot should have no human \
presence, write "no people in frame" and do not introduce models or hands.
  i. Quality and realism tail — close with concrete quality terms FLUX responds to: \
"ultra-detailed, photorealistic, 8k, sharp focus, true-to-life colors, professional \
commercial advertising photography, color-graded, clean composition".
  j. Negative cues woven in as positive instructions (FLUX has no negative-prompt slot \
here): "no warped or duplicated product, no different SKU or substitute packaging, no \
rebranded or generic label, no extra bottles or cans, no floating objects, no \
distorted text on the label, no fused fingers, no plastic-looking skin, no logos \
other than the original, no watermark, no text overlay outside the product label".

Hard rules for your output:
- Output ONLY the final prompt text. No preamble, no title, no markdown, no code \
fences, no labels like "Prompt:" or "Output:".
- Write in plain English, comma-separated phrases joined into a single paragraph. \
Diffusion models parse this format best.
- Use concrete, observable nouns and adjectives. Avoid metaphors, storytelling verbs, \
brand voice, and abstract marketing words.
- Repeat the most critical fidelity constraints (same product identity, label text, \
product shape, brand name) at least twice — once early, once near the end — because \
diffusion models weight repeated tokens more strongly.
- Never invent new copy, taglines, or logos on the product itself. If you mention the \
brand name, quote it verbatim from the reference.
- Never change product identity: the rendered subject must remain recognizably the \
same item as in the reference, not a lookalike or category-generic stand-in.
- Keep the entire prompt in one paragraph, no bullet points, no numbered lists, no \
headings in the final output.

User-provided context (may be empty; rely entirely on the image when empty):
"""


def ensure_env_loaded() -> None:
    load_dotenv()


def hf_token() -> str:
    ensure_env_loaded()
    t = (os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN") or "").strip()
    if not t:
        raise ValueError(
            "Missing Hugging Face token. Set HF_TOKEN or HUGGINGFACE_HUB_TOKEN in .env "
            "or the environment."
        )
    return t


def gemini_api_key() -> str:
    ensure_env_loaded()
    key = (
        os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    ).strip().strip('"').strip("'")
    if not key:
        raise ValueError(
            "Missing Gemini API key. Set GEMINI_API_KEY (or GOOGLE_API_KEY) in .env "
            "or the environment."
        )
    return key


def strip_code_fence(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?", "", text)
        text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def build_flux_prompt_with_gemini(
    product_image: Image.Image,
    *,
    user_prompt: str,
    gemini_model: str = GEMINI_MODEL_ID,
) -> str:
    ctx_block = (
        f"Creative direction: {user_prompt.strip()}"
        if user_prompt.strip()
        else "(none — infer everything from the image.)"
    )
    instruction = FLUX_PROMPT_BUILDER + ctx_block
    client = genai.Client(api_key=gemini_api_key())
    response = client.models.generate_content(
        model=gemini_model,
        contents=[instruction, product_image.convert("RGB")],
        config=types.GenerateContentConfig(temperature=0.4),
    )
    raw = (response.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned an empty prompt.")
    return strip_code_fence(raw)


def run_flux_image_to_image(
    product_image: Image.Image,
    flux_prompt: str,
    *,
    num_inference_steps: int | None = None,
    guidance_scale: float | None = None,
) -> Image.Image:
    client = InferenceClient(model=MODEL_ID, token=hf_token())
    kwargs: dict[str, Any] = {}
    if num_inference_steps is not None:
        kwargs["num_inference_steps"] = num_inference_steps
    if guidance_scale is not None:
        kwargs["guidance_scale"] = guidance_scale
    return client.image_to_image(image=product_image, prompt=flux_prompt, **kwargs)


def generate_ad_image(
    image_bytes: bytes,
    *,
    user_prompt: str = "",
    skip_gemini: bool = False,
    gemini_model: str = GEMINI_MODEL_ID,
    num_inference_steps: int | None = None,
    guidance_scale: float | None = None,
) -> tuple[Image.Image, str]:
    """Returns (output PIL image, flux_prompt used)."""
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("RGB")
    user_prompt = (user_prompt or "").strip()
    if skip_gemini:
        if not user_prompt:
            raise ValueError(
                "With skip_gemini, a non-empty prompt is required (no Gemini expansion)."
            )
        flux_prompt = user_prompt
    else:
        flux_prompt = build_flux_prompt_with_gemini(
            img, user_prompt=user_prompt, gemini_model=gemini_model
        )
    out = run_flux_image_to_image(
        img,
        flux_prompt,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
    )
    return out, flux_prompt


def image_to_png_bytes(im: Image.Image) -> bytes:
    buf = io.BytesIO()
    im.save(buf, format="PNG")
    return buf.getvalue()
