#!/usr/bin/env python3
"""Static release-candidate checks for Chess Opening Academy."""
from pathlib import Path
import json, re, subprocess, sys, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ANDROID = ROOT / "android"
PUBLIC = ANDROID / "app/src/main/assets/public"
errors = []
checks = []
def ok(message): checks.append(message)
def fail(message): errors.append(message)

# Required files
required = ["index.html", "manifest.webmanifest", "sw.js", "qa/chess-data-smoke-test.html", "src/app.js", "src/opening-data.js", "src/variation-data.js", "src/study-patterns.js", "src/puzzle-data.js", "src/styles.css", "engine/stockfish-loader.js"]
for rel in required:
    if (ROOT / rel).is_file(): ok(f"exists: {rel}")
    else: fail(f"missing required file: {rel}")

# JSON/XML/SVG parsing
try:
    json.loads((ROOT / "manifest.webmanifest").read_text())
    ok("manifest JSON parses")
except Exception as exc: fail(f"manifest JSON parse failed: {exc}")
try:
    ET.parse(ANDROID / "app/src/main/AndroidManifest.xml")
    ok("Android manifest XML parses")
except Exception as exc: fail(f"Android manifest XML parse failed: {exc}")
svg_files = list((ROOT / "pieces").glob("*.svg"))
if len(svg_files) != 12: fail(f"expected 12 piece SVGs, found {len(svg_files)}")
for path in svg_files:
    try: ET.parse(path)
    except Exception as exc: fail(f"invalid SVG {path.name}: {exc}")
if len(svg_files) == 12: ok("12 piece SVGs parse")

# Data IDs and duplicate detection
for rel, expected_min in [("src/opening-data.js", 25), ("src/variation-data.js", 55), ("src/puzzle-data.js", 12)]:
    text = (ROOT / rel).read_text()
    ids = re.findall(r'id:"([^"]+)"', text)
    if len(ids) < expected_min: fail(f"{rel}: expected at least {expected_min} entries, found {len(ids)}")
    elif len(ids) != len(set(ids)): fail(f"{rel}: duplicate IDs detected")
    else: ok(f"{rel}: {len(ids)} unique IDs")

# Node syntax checks
node_files = ["src/app.js", "src/opening-data.js", "src/variation-data.js", "src/study-patterns.js", "src/puzzle-data.js", "sw.js", "engine/stockfish-loader.js"]
node = subprocess.run(["node", "--version"], capture_output=True, text=True)
if node.returncode != 0: fail("Node.js is not available; JS syntax checks could not run")
else:
    for rel in node_files:
        result = subprocess.run(["node", "--check", str(ROOT / rel)], capture_output=True, text=True)
        if result.returncode == 0: ok(f"JavaScript syntax: {rel}")
        else: fail(f"JavaScript syntax failed for {rel}: {result.stderr.strip()}")

# Service worker local precache paths
sw_text = (ROOT / "sw.js").read_text()
match = re.search(r'const APP_SHELL\s*=\s*\[(.*?)\];', sw_text, re.S)
if not match: fail("could not parse service-worker APP_SHELL")
else:
    paths = re.findall(r'"([^\"]+)"', match.group(1))
    for rel in paths:
        if rel == "./": continue
        if not (ROOT / rel.removeprefix("./")).is_file(): fail(f"precache asset missing: {rel}")
    if not any(f"precache asset missing: {rel}" in e for e in errors for rel in paths): ok(f"service worker precache: {len(paths)} local paths exist")

# Android mirrored assets
mirror = ["index.html", "manifest.webmanifest", "sw.js"]
mirror += [f"src/{name}" for name in ["app.js", "opening-data.js", "variation-data.js", "styles.css", "study-patterns.js", "puzzle-data.js"]]
mirror += [f"pieces/{color}-{piece}.svg" for color in ["white", "black"] for piece in ["pawn", "rook", "knight", "bishop", "queen", "king"]]
mirror += ["engine/stockfish-loader.js"]
for optional_engine in ["engine/stockfish-19-lite-single.js", "engine/stockfish-19-lite-single.wasm"]:
    if (ROOT / optional_engine).is_file(): mirror.append(optional_engine)
for rel in mirror:
    left, right = ROOT / rel, PUBLIC / rel
    if not left.is_file() or not right.is_file(): fail(f"Android mirror missing: {rel}")
    elif left.read_bytes() != right.read_bytes(): fail(f"Android mirror mismatch: {rel}")
if not any("Android mirror" in e for e in errors): ok(f"Android mirror: {len(mirror)} files match")

# Data normalization and custom-line queue regression checks
app_text = (ROOT / "src/app.js").read_text()
for required_fragment in ["function normalizeProgressState()", "function sanitizeCustomLines(input)", "function renderCurriculumCoverage()", "document.documentElement.dataset.appReady=\"true\"", "renderCurriculumCoverage();", "function addStudyAnnotationsToGame(game,line)", "function saveEngineAnalysisToNotes()", "#saveEngineAnalysis", "getComments()", "state.customLines.find(v=>v.id===id)", "state.customLines.find(x=>x.id===b.dataset.lineId)", "const allDueCards=Object.entries(state.reviewCards)", "function deleteCustomLine(id)", "candidateVariation?.isCustom"]:
    if required_fragment in app_text: ok(f"app regression feature present: {required_fragment}")
    else: fail(f"app regression feature missing: {required_fragment}")

# Browser smoke test has a bounded dependency timeout and visible failure path
smoke_text = (ROOT / "qa/chess-data-smoke-test.html").read_text()
for fragment in ["Promise.race", "Timed out loading chess.js", "Dependency loading", "function validatePgnRoundTrip(Chess)", "Comment round-trip"]:
    if fragment in smoke_text: ok(f"browser smoke-test fallback present: {fragment}")
    else: fail(f"browser smoke-test fallback missing: {fragment}")

# Core-module startup fallback is present in the HTML shell
html_text = (ROOT / "index.html").read_text()
for fragment in ["dependencyBanner", "unhandledrejection", "appReady", "Reload"]:
    if fragment in html_text: ok(f"startup fallback present: {fragment}")
    else: fail(f"startup fallback missing: {fragment}")

# Engine loader exposes local-first selection and CDN fallback
loader_text = (ROOT / "engine/stockfish-loader.js").read_text()
for fragment in ["ENGINE_SOURCE local", "ENGINE_SOURCE cdn", "locateFile"]:
    if fragment in loader_text: ok(f"engine loader path present: {fragment}")
    else: fail(f"engine loader path missing: {fragment}")

# APK build workflow and helper script are present
for rel in [".github/workflows/android-debug-apk.yml", "android/build-apk.sh"]:
    if (ROOT / rel).is_file(): ok(f"APK build support present: {rel}")
    else: fail(f"APK build support missing: {rel}")

# Version and explicit manual-test limitations
build_gradle = (ANDROID / "app/build.gradle").read_text()
if "versionCode 46" in build_gradle and "versionName '3.46.0'" in build_gradle: ok("Android version metadata is 3.46.0 / code 46")
else: fail("Android version metadata does not match V3.46")

print("Chess Opening Academy — Static QA Report")
print("=" * 44)
for item in checks: print("PASS  " + item)
for item in errors: print("FAIL  " + item)
print()
print(f"Summary: {len(checks)} passed, {len(errors)} failed")
print("Not covered: real browser interaction, Stockfish CDN/WASM startup, Android Studio compilation, touch/drag behavior, and engine validation of opening theory.")
sys.exit(1 if errors else 0)
