#!/usr/bin/env python3
from pathlib import Path
import sys

ANDROID = Path(__file__).resolve().parent
PUBLIC = ANDROID / "app/src/main/assets/public"
WEB = ANDROID.parent
FILES = ["index.html", "manifest.webmanifest", "sw.js"]
FILES += [f"src/{name}" for name in ["app.js", "opening-data.js", "variation-data.js", "styles.css", "study-patterns.js", "puzzle-data.js"]]
FILES += [f"pieces/{color}-{piece}.svg" for color in ["white", "black"] for piece in ["pawn", "rook", "knight", "bishop", "queen", "king"]]
FILES += ["engine/stockfish-loader.js"]
for optional_engine in ["engine/stockfish-19-lite-single.js", "engine/stockfish-19-lite-single.wasm"]:
    if (WEB / optional_engine).is_file(): FILES.append(optional_engine)
missing = []
for rel in FILES:
    web_file = WEB / rel
    android_file = PUBLIC / rel
    if not web_file.exists() or not android_file.exists():
        missing.append(f"missing: {rel}")
    elif web_file.read_bytes() != android_file.read_bytes():
        missing.append(f"mismatch: {rel}")
if missing:
    print("Android asset mirror check failed:")
    print("\n".join(missing))
    sys.exit(1)
print(f"Android asset mirror check passed: {len(FILES)} files match.")
