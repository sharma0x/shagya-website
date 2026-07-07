#!/usr/bin/env python3
# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "pinterest-dl>=1.0.0",
# ]
# ///
"""
Pinterest image downloader — search mode.

Downloads images from Pinterest by search query using the pinterest-dl package.

Usage:
    python scripts/pinterest-dl.py "saree" ./downloads --num 50
    python scripts/pinterest-dl.py "banarasi silk" --num 100 --min-resolution 800,800
"""

import argparse
import sys

from pinterest_dl import PinterestDL


def parse_resolution(value: str) -> tuple[int, int]:
    parts = value.split(",")
    if len(parts) != 2:
        raise argparse.ArgumentTypeError("must be width,height (e.g. 800,800)")
    return int(parts[0]), int(parts[1])


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download images from Pinterest by search query"
    )
    parser.add_argument("query", help="Pinterest search term")
    parser.add_argument(
        "output_dir",
        nargs="?",
        default="./pinterest-downloads",
        help="Download directory (default: ./pinterest-downloads)",
    )
    parser.add_argument(
        "-n", "--num", type=int, default=30, help="Max images to download (default: 30)"
    )
    parser.add_argument(
        "--min-resolution",
        type=parse_resolution,
        help="Min resolution filter (e.g. 800,800)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.4,
        help="Delay between requests in seconds (default: 0.4)",
    )
    parser.add_argument(
        "--caption",
        choices=["none", "txt", "json"],
        default="none",
        help="Caption format (default: none)",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable verbose logging"
    )
    parser.add_argument(
        "--timeout", type=int, default=15, help="Request timeout in seconds (default: 15)"
    )

    args = parser.parse_args()

    kwargs = {
        "query": args.query,
        "output_dir": args.output_dir,
        "num": args.num,
        "delay": args.delay,
    }
    if args.min_resolution:
        kwargs["min_resolution"] = args.min_resolution
    if args.caption != "none":
        kwargs["caption"] = args.caption

    try:
        client = PinterestDL.with_api(timeout=args.timeout, verbose=args.verbose)
        results = client.search_and_download(**kwargs)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    count = len(results) if results else 0
    print(f"\nDownloaded {count} image(s) to {args.output_dir}/")


if __name__ == "__main__":
    main()
