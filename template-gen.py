

from __future__ import annotations

import os

# Keep this Python process off local NVIDIA GPUs (inference is remote).
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "")

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

from flux_i2i_service import GEMINI_MODEL_ID, generate_ad_image


def _prompt_path(message: str) -> Path:
    while True:
        raw = input(message).strip().strip('"')
        if not raw:
            print("Please enter a non-empty path.", file=sys.stderr)
            continue
        path = Path(raw).expanduser()
        if path.is_file():
            return path
        print(f"File not found: {path}", file=sys.stderr)


def _prompt_text(message: str, *, allow_empty: bool = False) -> str:
    while True:
        raw = input(message).strip()
        if raw or allow_empty:
            return raw
        print("Please enter a non-empty value.", file=sys.stderr)


def _default_output_path(output_dir: Path) -> Path:
    output_dir = output_dir.expanduser()
    output_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return output_dir / f"flux-i2i-{stamp}.png"


def main() -> None:
    p = argparse.ArgumentParser(
        description=(
            "Gemini expands product image + brief into a detailed FLUX i2i prompt, "
            "then runs black-forest-labs/FLUX.2-klein-9B on Hugging Face. "
            "Omit -i/-p to be prompted at runtime."
        )
    )
    p.add_argument("--input", "-i", type=Path, default=None, help="Input product image path")
    p.add_argument(
        "--prompt",
        "-p",
        type=str,
        default=None,
        help=(
            "Optional creative direction for Gemini. If omitted, Gemini infers the "
            "entire scene from the product image. Required only when --skip-gemini is set."
        ),
    )
    p.add_argument(
        "--output-dir",
        type=Path,
        default=Path("output"),
        help="Directory for saved images (used when --output is not set)",
    )
    p.add_argument(
        "--output",
        "-o",
        type=Path,
        default=None,
        help="Exact output file path (overrides automatic name under --output-dir)",
    )
    p.add_argument(
        "--skip-gemini",
        action="store_true",
        help="Send --prompt directly to FLUX (no Gemini layer)",
    )
    p.add_argument(
        "--show-prompt",
        action="store_true",
        help="Print the prompt used for FLUX (expanded or raw)",
    )
    p.add_argument(
        "--gemini-model",
        type=str,
        default=GEMINI_MODEL_ID,
        help=f"Gemini model for prompt expansion (default: {GEMINI_MODEL_ID})",
    )
    p.add_argument("--steps", type=int, default=None, help="num_inference_steps (if supported)")
    p.add_argument("--guidance", type=float, default=None, help="guidance_scale (if supported)")
    args = p.parse_args()

    input_path = args.input
    if input_path is None:
        input_path = _prompt_path("Input image path: ")
    else:
        input_path = input_path.expanduser()
        if not input_path.is_file():
            print(f"Input not found: {input_path}", file=sys.stderr)
            sys.exit(1)

    user_prompt = args.prompt

    if user_prompt is None and sys.stdin.isatty():
        user_prompt = _prompt_text(
            "User prompt (creative direction, optional — press Enter to skip): ",
            allow_empty=True,
        )

    user_prompt = (user_prompt or "").strip()

    try:
        image, flux_prompt = generate_ad_image(
            input_path.read_bytes(),
            user_prompt=user_prompt,
            skip_gemini=args.skip_gemini,
            gemini_model=args.gemini_model,
            num_inference_steps=args.steps,
            guidance_scale=args.guidance,
        )
    except ValueError as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(str(e), file=sys.stderr)
        sys.exit(2)

    if args.show_prompt:
        print("--- FLUX prompt ---")
        print(flux_prompt)
        print("-------------------")

    out_path = args.output
    if out_path is None:
        out_path = _default_output_path(args.output_dir)
    else:
        out_path = out_path.expanduser()
        out_path.parent.mkdir(parents=True, exist_ok=True)

    image.save(out_path)
    print(f"Saved: {out_path.resolve()}")


if __name__ == "__main__":
    main()
