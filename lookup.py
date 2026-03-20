#!/usr/bin/env python3
"""
TikTok Video Lookup Tool
========================
Resolves hashed video IDs from the public dataset to TikTok URLs
using the local Hashed_IDs.csv mapping file.

Security:
  - The mapping file (Hashed_IDs.csv) must be stored locally and never
    committed to any public repository.
  - Video URLs are displayed on screen only — nothing is written to disk.
  - Intended for authorized researchers conducting qualitative analysis.

Usage:
  python3 lookup.py                          # interactive mode
  python3 lookup.py 587deaa78f6e             # direct lookup by hash prefix
  python3 lookup.py --search "Chueca"        # search by description text

Setup:
  Set HASH_MAPPING_FILE in your .env file (or edit the default path below).
"""

import csv
import hashlib
import os
import sys

# --- Configuration ---
DEFAULT_MAPPING_PATH = os.path.expanduser("~/TikTok/csv/Hashed_IDs.csv")
DATASET_PATH = os.path.expanduser("~/TikTok/Dataset_Hashed.csv")
TIKTOK_VIDEO_URL = "https://www.tiktok.com/@{author}/video/{video_id}"
TIKTOK_VIDEO_URL_SHORT = "https://www.tiktok.com/video/{video_id}"


def load_env():
    """Load .env file if present (one directory up from script, or home)."""
    for env_path in [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env"),
        os.path.expanduser("~/.env"),
    ]:
        env_path = os.path.normpath(env_path)
        if os.path.isfile(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, _, val = line.partition("=")
                        os.environ.setdefault(key.strip(), val.strip().strip("'\""))
            break


def get_mapping_path():
    """Resolve the mapping file path from env or default."""
    load_env()
    path = os.environ.get("HASH_MAPPING_FILE", DEFAULT_MAPPING_PATH)
    path = os.path.expanduser(path)
    if not os.path.isfile(path):
        print(f"\n  Mapping file not found: {path}")
        print(f"  Set HASH_MAPPING_FILE in your .env or place Hashed_IDs.csv at:")
        print(f"  {DEFAULT_MAPPING_PATH}\n")
        sys.exit(1)
    return path


def load_mapping(path):
    """
    Load the hash mapping CSV.
    Expected columns: hashed_videoId, videoId (and optionally hashed_authorId, authorId).
    Auto-detects the column names from the header.
    """
    mapping = {}
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        cols = reader.fieldnames

        # Find the right columns
        hash_col = None
        id_col = None
        author_hash_col = None
        author_id_col = None

        for c in cols:
            cl = c.lower().strip()
            if "hashed" in cl and "video" in cl:
                hash_col = c
            elif "video" in cl and "hashed" not in cl:
                id_col = c
            elif "hashed" in cl and "author" in cl:
                author_hash_col = c
            elif "author" in cl and "hashed" not in cl:
                author_id_col = c

        if not hash_col or not id_col:
            # Fallback: assume first two columns are hash, original
            hash_col = cols[0]
            id_col = cols[1]
            if len(cols) > 2:
                author_hash_col = cols[2] if len(cols) > 2 else None
                author_id_col = cols[3] if len(cols) > 3 else None

        for row in reader:
            h = row[hash_col].strip()
            vid = row[id_col].strip()
            author = row.get(author_id_col, "").strip() if author_id_col else ""
            mapping[h] = {"videoId": vid, "authorId": author}
            # Also index by prefix (first 12 chars) for convenience
            mapping[h[:12]] = {"videoId": vid, "authorId": author, "full_hash": h}

    return mapping


def load_dataset(path):
    """Load the hashed dataset for description search."""
    if not os.path.isfile(path):
        return []
    rows = []
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    return rows


def resolve_hash(mapping, query):
    """Look up a hashed ID (full or prefix) and return video info."""
    query = query.strip()
    if query in mapping:
        return mapping[query]
    # Try prefix match
    for key, val in mapping.items():
        if key.startswith(query) and len(key) == 64:
            return {**val, "full_hash": key}
    return None


def format_url(info):
    """Build the TikTok video URL."""
    vid = info["videoId"]
    author = info.get("authorId", "")
    if author:
        return TIKTOK_VIDEO_URL.format(author=author, video_id=vid)
    return TIKTOK_VIDEO_URL_SHORT.format(video_id=vid)


def search_descriptions(dataset, query):
    """Search video descriptions and return matching hashed IDs."""
    query_lower = query.lower()
    results = []
    for row in dataset:
        desc = row.get("desc", "")
        if query_lower in desc.lower():
            results.append({
                "hashed_videoId": row.get("hashed_videoId", ""),
                "date": row.get("dateTime", "")[:10],
                "desc": desc[:120] + ("..." if len(desc) > 120 else ""),
            })
    return results


def interactive_mode(mapping, dataset):
    """Run the interactive lookup prompt."""
    print()
    print("  ╔══════════════════════════════════════════╗")
    print("  ║   TikTok Video Lookup (Local & Secure)   ║")
    print("  ╚══════════════════════════════════════════╝")
    print()
    print(f"  Mapping: {len(mapping) // 2} entries loaded")
    print(f"  Dataset: {len(dataset)} rows loaded")
    print()
    print("  Commands:")
    print("    <hash>           Look up by hashed ID (full or 12-char prefix)")
    print("    /search <text>   Search descriptions, then look up a result")
    print("    /quit            Exit")
    print()

    while True:
        try:
            query = input("  lookup> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n  Goodbye.\n")
            break

        if not query:
            continue

        if query.lower() in ("/quit", "/exit", "/q", "quit", "exit"):
            print("  Goodbye.\n")
            break

        if query.lower().startswith("/search "):
            search_term = query[8:].strip()
            if not search_term:
                print("  Usage: /search <text>\n")
                continue
            results = search_descriptions(dataset, search_term)
            if not results:
                print(f"  No descriptions match '{search_term}'.\n")
                continue
            print(f"\n  Found {len(results)} match(es):\n")
            for i, r in enumerate(results[:20], 1):
                prefix = r["hashed_videoId"][:12]
                print(f"  [{i:2d}] {prefix}  {r['date']}  {r['desc']}")
            if len(results) > 20:
                print(f"  ... and {len(results) - 20} more")
            print()
            # Offer to look up one
            try:
                pick = input("  Enter number to look up (or press Enter to skip): ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n  Goodbye.\n")
                break
            if pick.isdigit():
                idx = int(pick) - 1
                if 0 <= idx < len(results):
                    h = results[idx]["hashed_videoId"]
                    info = resolve_hash(mapping, h)
                    if info:
                        print(f"\n  Video URL: {format_url(info)}")
                        print(f"  Video ID:  {info['videoId']}")
                        if info.get("authorId"):
                            print(f"  Author ID: {info['authorId']}")
                    else:
                        print(f"  Hash {h[:12]} not found in mapping file.")
            print()
            continue

        # Direct hash lookup
        info = resolve_hash(mapping, query)
        if info:
            print(f"\n  Video URL: {format_url(info)}")
            print(f"  Video ID:  {info['videoId']}")
            if info.get("authorId"):
                print(f"  Author ID: {info['authorId']}")
            if info.get("full_hash"):
                print(f"  Full hash: {info['full_hash']}")
            # Also show description if dataset is loaded
            for row in dataset:
                if row.get("hashed_videoId", "").startswith(query):
                    desc = row.get("desc", "")
                    if desc:
                        print(f"  Desc:      {desc[:120]}")
                    break
            print()
        else:
            print(f"  Not found: '{query}'. Try a full 64-char hash or 12-char prefix.\n")


def main():
    mapping_path = get_mapping_path()
    mapping = load_mapping(mapping_path)
    dataset = load_dataset(DATASET_PATH)

    # Direct lookup from command line
    if len(sys.argv) > 1:
        if sys.argv[1] == "--search" and len(sys.argv) > 2:
            search_term = " ".join(sys.argv[2:])
            results = search_descriptions(dataset, search_term)
            if not results:
                print(f"No descriptions match '{search_term}'.")
                sys.exit(0)
            print(f"\nFound {len(results)} match(es):\n")
            for r in results[:20]:
                prefix = r["hashed_videoId"][:12]
                info = resolve_hash(mapping, r["hashed_videoId"])
                url = format_url(info) if info else "(not in mapping)"
                print(f"  {prefix}  {r['date']}  {url}")
                print(f"           {r['desc']}")
            sys.exit(0)

        query = sys.argv[1]
        info = resolve_hash(mapping, query)
        if info:
            print(format_url(info))
        else:
            print(f"Not found: {query}")
            sys.exit(1)
        sys.exit(0)

    # Interactive mode
    interactive_mode(mapping, dataset)


if __name__ == "__main__":
    main()
