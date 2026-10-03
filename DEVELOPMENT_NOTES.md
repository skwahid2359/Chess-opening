# Development notes — V3.2

## Added in this phase
- PWA manifest and chess-knight SVG icons.
- Service worker caching for same-origin app shell assets.
- Mobile Library and Tools buttons so side panels can be opened on small screens.
- Android Studio WebView project that packages the web app as local assets.
- Build instructions and explicit dependency limitations.

## Still to do
1. Browser end-to-end testing and mobile viewport QA.
2. Bundle chess.js locally to remove CDN dependency.
3. Audit all stored opening lines with a chess rules engine.
4. Add complete variation trees and PGN import/export.
5. Integrate Stockfish and spaced repetition.
6. Build and test a signed/unsigned APK on Android SDK tooling.

## Validation performed
Source files should be syntax-checked before each archive. A successful JavaScript syntax check is not equivalent to runtime or chess-content validation. APK compilation has not been performed in this environment.


## V3.3 Opening Curriculum phase
- Added `src/variation-data.js` with curated SAN lines for Italian, Ruy Lopez, Scotch, Sicilian, French, Caro-Kann, Scandinavian, Petrov, Queen's Gambit Declined/Accepted, London, King's Indian, Slav, Elephant Gambit, and Owen's Defense.
- Variation Lab provides line selection, strategic plans, common mistakes, transition notes, full-line loading, and move recall practice.
- Service-worker cache version bumped and Android WebView public assets synchronized.
- Important limitation: source syntax and package consistency can be checked here, but no full browser/Android runtime test or engine verification is claimed.


## V3.4 Expanded curriculum phase
- Added `src/study-patterns.js` and a filterable Pattern Trainer for mating patterns, tactical ideas, and endgame concepts.
- Study prompts separate recognition cues and quick-check questions from answer reveal.
- Service-worker cache version bumped; Android WebView assets must mirror the latest web source.
- These are concept cards only, not engine-validated tactical puzzles or full endgame tablebase examples.

## V3.5 — Interactive variation tree and practice progress

Implemented:
- Tap/click any SAN move in a curated line to jump to the resulting position.
- Branch candidates are derived from included lines that share the exact SAN prefix, avoiding invented continuations.
- Local per-line attempts/correct counts and an explicit practice-goal threshold (minimum 5 attempts, at least 80% accuracy).
- Variation cards display practice progress; reset clears this new progress key too.
- Updated service-worker cache version to invalidate the previous shell.

Verification:
- `node --check` passed for app.js, variation-data.js, and study-patterns.js.
- Browser/Android end-to-end behavior and all chess sequences still require runtime and chess-engine verification.

Still pending:
- Complete PGN-backed branching coverage and verified repertoire trees.
- Board-based tactics/mate/endgame puzzle positions.
- Stockfish integration after curriculum/training foundations.
- Chess.com-inspired green/white board, licensed/original piece art, smooth animations, and touch drag/drop (explicitly deferred pending user confirmation).

## V3.6 — PGN study exchange (next phase started)

Implemented:
- PGN text area in the Tools sidebar.
- Import parses PGN into a new chess.js game before replacing current state; failed parsing leaves the current board unchanged.
- Export places current move history in the text area and attempts clipboard copy with manual fallback.
- Mobile tools sidebar includes PGN controls.

Verification status:
- Source syntax checks are run for each JavaScript module.
- Complex PGN variations, annotations, and Android clipboard behavior still need runtime tests.

## V3.7 — Spaced review scheduling

Implemented:
- Per-position local review cards keyed by variation/opening and ply.
- Correct answers schedule increasing intervals (1/3/7/14/30 days); incorrect answers are due again in 10 minutes.
- Training prioritizes the oldest due card across the saved review queue and otherwise practices the selected line.
- Added a Reviews Due metric and included review cards in progress reset.

Verification status:
- Requires interactive browser testing to confirm the flow end to end; schedule logic is source-reviewed only.

## V3.8 — Opening line integrity checks (next phase started)

Implemented:
- Startup validation of curated line SAN sequences and opening base sequences using chess.js replay.
- Variation Lab displays a legal-line count and per-line data status.
- Prevents invalid curated lines from loading directly or being used in training; due review skips invalid lines.

Limitations:
- This check runs inside the app at runtime, so it has not been executed in this build environment against the remote chess.js module.
- A legal sequence is not necessarily theoretically best or comprehensive; engine/reference verification remains a separate task.


## V3.9 Board Puzzle Lab

Added a separate interactive puzzle board with click-to-move, reset, reveal-solution, category filters, and local solved/attempt tracking. Runtime validation checks each configured FEN and expected move against chess.js, including goal-specific validation for checkmate, promotion, and capture. The king-activity exercise validates legality but is explicitly presented as a positional concept, not an engine-verified best move. Browser/device testing and engine evaluation remain pending.


## V3.10 Puzzle Mastery & Spaced Review

Added a due-review filter for board puzzles. Correct solutions advance a local review interval (1, 3, 7, 14, 30 days); incorrect legal attempts reset repetitions and schedule a retry after 10 minutes. This is a simple heuristic. Due status is based on the device clock and local storage. Full browser/device QA remains pending.


## V3.11 Full-Line Rehearsal

Added a rehearsal dialog that replays the selected opening/variation from the initial position, prompts the learner to select their side's next move, and auto-plays the opponent's moves from the study line. The expected move is checked against legal moves at each prompt. Completion records line progress. Browser and Android runtime tests remain pending.


## V3.12 Personal Variation Repertoire

Added a persistent list of saved variation IDs, saved-line load/remove controls, and selected-variation PGN export using chess.js headers. Exported PGN is placed in the existing PGN field and copied when clipboard access is available. Browser and Android runtime testing remains pending.


## V3.13 Learning Roadmap

Added five learning stages with progress derived from saved line practice/completion and solved board puzzles. The roadmap lets the user jump to the next incomplete opening in a stage or to the puzzle lab. Completion means local practice thresholds, not a chess engine assessment. Browser and Android runtime testing remains pending.


## V3.14 Personal Study Notes

Added a per-variation local notes editor with save/copy/clear actions and a 3,000-character limit. Saved note text is HTML-escaped before insertion into the textarea. Reset progress clears notes as well. Runtime tests across browsers/devices remain pending.


## V3.15 Opening Data Health

Added a content QA panel summarizing legal-sequence checks for openings and variations and goal checks for configured puzzles. Failed records display the data ID, move sequence, and validation reason. The report explicitly does not claim engine analysis or opening-theory correctness.


## V3.16 Progress Backup / Restore

Added a versioned JSON backup format and type-checked restore path. Restore requires user confirmation before replacing localStorage values. Backup includes study notes and repertoire, so the UI reminds users to keep it private. This has not been tested in an actual browser/device session yet.


## V3.17 Keyboard Accessibility

Main board squares now expose button semantics, accessible square/piece labels, Enter/Space selection, and arrow-key focus movement that accounts for board flip. Position status is announced through a live region and controls have visible focus styles. Screen-reader and real keyboard testing remains pending.


## V3.18 Local Data Recovery

Added a typed safe reader for localStorage JSON. Invalid JSON or unexpected root types fall back to default state rather than throwing during app initialization. Stored values are not silently overwritten/deleted by the reader. Browser quota errors during writes and corrupted nested objects still need runtime QA.


## V3.19 Variation Expansion Pack

Added 12 additional study lines (Italian Evans, Ruy Lopez Exchange, Sicilian Najdorf-style setup, French Tarrasch, Caro-Kann Classical, Scandinavian Portuguese-style line, QGD Exchange, King's Indian Sämisch, Grünfeld Russian, Nimzo Rubinstein, English Symmetrical, London Jobava). The Data Health panel checks move legality at runtime. No engine evaluation was run, so descriptions avoid best-move claims and lines should be reviewed before treating them as authoritative repertoire.


## V3.20 Personal PGN Lines

Added custom line persistence based on the current game's SAN history, with a required user-provided name and replay validation from the standard initial position. Custom lines appear in their own queue and can be loaded, rehearsed, annotated, exported, or saved to the variation queue. Backup/restore includes custom lines. Lines imported from a nonstandard FEN with no full starting-position move history cannot be saved as complete opening lines.


## V3.21 Position-Based Transposition Explorer

Added same-position lookup across curated and custom study lines. Positions are keyed from the first four FEN fields so move counters do not prevent a match, while side to move/castling/en-passant state remains part of the key. The UI can jump to the matching line and ply. This is exact-position matching, not engine analysis. Runtime performance and UI behavior remain to be tested in browser/device sessions.


## V3.22 Green Board & Original Pieces

Added original local SVG piece art, green/ivory board colors, last-move highlighting, a subtle destination-piece arrival animation, desktop drag-and-drop, and a promotion picker. Tap/click-to-move remains available. The artwork is original simplified SVG and is not copied from Chess.com. Service worker pre-caches all piece assets. Visual rendering and drag behavior still require browser/device QA.


## V3.23 Position-Specific Annotations

Added a separate local note keyed by variation ID and current ply, with save/clear controls. Whole-line notes remain separate. Position notes are included in backup/restore and Reset Progress. Text is escaped before rendering into the textarea.


## V3.24 Stockfish Analysis (CDN-backed)

Added UCI controls and a Worker loader targeting Stockfish.js 19 lite single-threaded assets on jsDelivr. The UI parses UCI depth/score/PV/bestmove messages and converts UCI move sequences to SAN using chess.js. CDN path resolution, worker boot, WASM fetch, evaluation perspective, and Android WebView behavior still require end-to-end verification. No claim is made that engine loading works in all environments.


## V3.25 Full Repertoire PGN Export

Added a multi-game PGN export from saved opening repertoire, saved variation IDs, and custom study lines. Entries are deduplicated by ID and checked for legal replay from the standard start position before export. The bundle is placed in the existing PGN text area and copied when clipboard permission allows. Runtime PGN round-trip testing remains pending.


## V3.26 Engine UCI Stability

Refactored engine message parsing to a single worker handler, with explicit ready-state transitions and a search-ready barrier. This avoids accumulating nested onmessage wrappers across repeated analyses. Stale bestmove messages are ignored while waiting to start a new search. Runtime engine loading and repeated analyze/stop cycles still need real-device testing.


## V3.27 Engine Diagnostics

Added a check-connection action, engine name display, and a 40-line UCI diagnostic log. Commands and responses are logged for troubleshooting. The log is in-memory only and is not included in progress backups. Actual engine initialization remains unverified in this environment.


## V3.28 Opening Mastery Analytics

Added per-opening practice analytics from lineProgress records, with e4/d4/flank filters, total attempts, accuracy, practice-goal status, saved repertoire counts, and direct study navigation. It intentionally labels completion as a practice threshold rather than engine-verified mastery.


## V3.29 Android Release Preparation

Updated Android version metadata and added a source-vs-Android-asset mirror checker plus release notes. APK compilation and device testing remain pending because Android SDK/Gradle build availability has not been confirmed in this environment.


## V3.30 Release Candidate QA

Added a repeatable static QA script for required files, manifest and Android manifest parsing, SVG parsing, unique opening/variation/puzzle IDs, JavaScript syntax, service-worker precache assets, Android mirror equality, and Android version metadata. This does not test browser UI behavior, external Stockfish loading, or APK compilation.


## V3.31 Data Schema Hardening

Added root and nested-value sanitization for local progress and custom PGN lines to reduce crashes from malformed backups/localStorage. Custom lines are limited to 500 plies and validated from the standard starting position before being retained. Fixed the saved variation queue so custom lines can be listed and loaded as well as curated variations.


## V3.31 Data Schema Hardening

Normalizes saved repertoire IDs, custom lines, line progress, review cards, notes, puzzle attempts/reviews, and stats during startup. Custom lines are rejected if their structure or SAN replay is invalid. Saved variation queue now includes custom lines and loads them through the custom-line loader. Analytics refresh is wired into progress saves.


## V3.32 Board Puzzle Expansion

Added six additional board-based puzzles, bringing the collection to ten. New positions cover mate in one, promotion with check, loose queen/rook captures, and king activity in a pawn ending. Runtime goal validation is available in the app, but no Stockfish evaluation or end-to-end browser testing was performed.


## V3.33 Opening Traps & Mate Patterns

Added two board puzzles (Fool's Mate and Scholar's Mate patterns) and three curated tactical study lines (Scholar's Mate, Fried Liver Attack, Two Knights line). The app's Data Health report validates puzzle goals and line legality at runtime. No engine evaluation or browser interaction test was performed here.


## V3.34 Opening Family Coverage Expansion

Added ten curated lines across major opening families, taking the variation collection to 55 entries. The static QA script now checks for at least 55 unique variation IDs. Legality is checked by the app's Data Health panel at runtime; no Stockfish evaluation was run.


## V3.35 Curriculum Coverage Map

Added a curriculum coverage dashboard across all opening entries, including variation counts and longest stored line lengths. Filters mirror the e4/d4/flank grouping. It intentionally reports stored data counts and does not imply theoretical completeness.


## V3.36 Annotated PGN Export

Added a shared helper that writes line-level study notes/ideas as a starting-position PGN comment and position-specific notes after the corresponding move. Both full-repertoire and active-variation export use the helper. PGN round-trip behavior still needs testing with the browser chess.js version and a separate PGN reader.


## V3.37 PGN Comment Import

On PGN import, the UI reports comment count when supported by chess.js. Saving the imported game as a custom line replays it from the standard start, maps comment FENs to ply indexes, and stores comments as position notes. This mapping and export round-trip still require browser testing against the actual chess.js runtime.


## V3.38 Browser Chess Data Smoke Test

Added a standalone browser harness using chess.js 1.4.0 to replay opening and variation lines and validate puzzle solutions against their declared goal. It is not run by static QA because it needs browser module loading and CDN access; it gives the user a repeatable content validation report.


## V3.39 Browser Smoke Test Reliability

The browser data test now loads chess.js and local data modules dynamically with a bounded timeout and a visible dependency error row. A failed CDN request is reported as a harness startup failure, not as a chess-data validation failure.


## V3.40 Custom Line Spaced Review

Extended the due-card lookup to include custom lines and creates a custom opening context when reviewing one. The custom line's variation ID remains the review/progress key. Deleting a custom line now cleans related progress, notes, position notes, review cards, and repertoire IDs.


## V3.41 Startup Dependency Diagnostics

Added an HTML-shell fallback banner that appears when the app module errors/rejects or does not set the appReady marker within eight seconds. The app hides the banner only after initialization and first render complete. Runtime behavior still requires browser/device verification.


## V3.42 PGN Round-Trip QA

Added a browser-only test that creates a short game with comments, exports PGN, imports it into a new Chess instance, and checks both move history and comments. It will run alongside opening/variation legality and puzzle-goal checks when the CDN dependencies load.


## V3.43 Save Engine Analysis to Notes

Added a save-analysis action after a completed engine search. The note is position-specific only when replaying the selected line to its current ply exactly matches the analyzed FEN; otherwise it is stored as a line-level note with FEN context.


## V3.44 Local-First Engine Loader

The Stockfish worker now attempts a local JS/WASM pair first, then falls back to the CDN if the local JavaScript file cannot be imported. The UI logs the selected source. No engine binaries are included, and CDN/WASM initialization remains runtime-unverified.


## V3.45 APK Build Pipeline

Added a local build script and a manual-dispatch GitHub Actions workflow that installs Java/Android SDK/Gradle, runs static QA, assembles a debug APK, and uploads the APK artifact. The workflow has not been executed in this environment.
