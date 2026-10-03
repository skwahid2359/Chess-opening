# Chess Opening Academy — V3.8 Line Integrity

V3.3 continues the existing V3.1 project rather than rebuilding it. It adds an installable web-app manifest, app icons, a same-origin service-worker cache for the application shell, mobile Library/Tools toggles, and an Android Studio WebView wrapper.

## Web/PWA run
Serve this directory over HTTP (service workers and ES modules do not work reliably from `file://`):

```bash
python3 -m http.server 8123
```
Open `http://localhost:8123/`. On Android Chrome, use the browser menu and choose **Install app** or **Add to Home screen** when offered.

## Android APK
Open the `android/` directory in Android Studio and follow `android/BUILDING_ANDROID.md`. This deliverable includes Android source, not a precompiled APK. Android SDK/Gradle build tools are not installed in the current build environment, so a compiled APK could not be verified here.

## Current limitations
- `chess.js` is loaded from jsDelivr, so first launch requires internet access.
- Lichess Masters Explorer is an online feature.
- Opening lines still need comprehensive chess-content verification.
- Stockfish, PGN import/export, spaced repetition, cloud sync, and automated device tests remain future phases.


## V3.3 — Opening Curriculum

- Added a curated Variation Lab for selected opening families, with main lines and a few less-common systems.
- Each line includes a study sequence, strategic plans for both sides, common mistakes, and an endgame/transition note.
- Load a full line onto the board or use Guess the Move to practise a position from the selected line.
- These are educational starter lines, not engine-certified best-move claims. Verify with an engine or trusted opening reference before tournament use.
- This release does not yet provide exhaustive coverage of every opening, a complete PGN variation tree, or mating/endgame puzzle libraries; those remain future phases.


## V3.4 — Expanded study curriculum

- Added a Pattern Trainer with concept lessons for mating patterns, tactical ideas, and endgame principles.
- Concepts include back-rank mate, smothered mate, Anastasia's mate, Greek gift calculation, deflection, opposition, rule of the square, rook activity behind passed pawns, Lucena, Philidor, wrong-bishop rook pawn, and king activation.
- The trainer separates recognition cues from the answer so learners can think before revealing it. These are concept flashcards, not board-specific tactical puzzles.
- Stockfish, engine-evaluated variations, complete PGN trees, and board-based mate/endgame puzzle positions remain future work.

## V3.5 — Interactive variation tree and practice progress

- Variation notation is now clickable: choose a ply to load the exact position along the selected study line.
- The branch explorer shows next moves found in curated lines that share the exact move prefix from the current study position. Selecting a branch loads its corresponding continuation.
- Per-line practice attempts and correct answers are stored locally. A practice goal is marked after at least five attempts and 80% accuracy; this is a practice threshold, not proof that every move in a line has been mastered.
- The variation list displays practice accuracy/goal status, and progress is persisted in local storage.
- This remains a curated-line explorer, not an exhaustive opening database. Lines have not been engine-certified, and branching options only exist where the included curated lines actually share a position prefix.

## V3.6 — PGN study exchange

- Added PGN import into the active board and move history.
- Added PGN export for the current move history, with clipboard support where available and a manual-copy fallback.
- Import replaces the current board position/history; invalid PGN displays a user-facing error instead of changing the board.
- PGN compatibility should be tested with real-world annotated games and variations in a browser before relying on it for complex studies.

## V3.7 — Spaced review scheduling

- Correct answers schedule the position for progressively longer intervals (1, 3, 7, 14, then 30 days).
- Incorrect answers schedule the position for a short retry window (10 minutes).
- Guess the Move prioritizes the oldest due review across saved review cards, then falls back to a random move from the currently selected line when nothing is due.
- Review scheduling is local to the current browser/device and can be reset with the app's progress reset control. It is a lightweight study aid, not a validated adaptive-learning algorithm.

## V3.8 — Opening line integrity checks

- The app replays every curated variation and base opening sequence through chess.js at startup to identify illegal SAN sequences.
- Variation Lab shows the count of curated lines that pass legal-move replay and flags individual lines that need review.
- Invalid lines are blocked from direct loading and training; due-review selection skips invalid study lines.
- Legal move replay validates notation/legality only. It does not certify strategic quality, completeness, or engine-best status.


## V3.9 — Board Puzzle Lab

- Adds interactive board-based mate, tactical capture, promotion, and king-activity exercises.
- Puzzle moves are entered by selecting a piece and destination square.
- Puzzle solutions are checked at runtime against the configured FEN and goal (mate, promotion, or capture).
- Solved IDs and attempt counts are saved in local storage.
- Puzzle board is separate from the main study board.
- The app still loads chess.js from its configured CDN; full offline use is not guaranteed.
- This phase does not add Stockfish or the deferred green-white board/piece-animation redesign.


## V3.10 — Puzzle Mastery & Spaced Review

- Adds due-puzzle review mode, with due-count indicator.
- Correct solutions schedule review intervals of 1, 3, 7, 14, then 30 days.
- Incorrect legal attempts schedule a retry in 10 minutes.
- Puzzle attempts, solved IDs, and review schedules persist in local storage.
- Review scheduling is a lightweight local heuristic, not an adaptive chess-engine evaluation.


## V3.11 — Full-Line Rehearsal

- Adds a full-line rehearsal dialog for the selected curated variation or opening.
- Learner can choose White or Black; moves for the other side are replayed automatically from the validated study line.
- Correct continuation choices advance the position; incorrect choices provide feedback without corrupting the line state.
- Rehearsal completion updates line progress.
- Rehearsal uses multiple-choice SAN moves, not free board drag-and-drop.


## V3.12 — Personal Variation Repertoire

- Adds save/remove for curated variation lines independently of whole-opening repertoire.
- Adds saved-line queue with one-tap loading.
- Adds export of the selected curated line to PGN, including study headers, and places it in the PGN text area for copying.
- Saved line IDs persist locally and are mirrored to the Android web assets.


## V3.13 — Learning Roadmap

- Adds a five-stage course path: open games, Black vs 1.e4, queen's pawn systems, flank/hypermodern openings, and tactics/endgames.
- Shows completed opening lines, practiced openings, puzzle completion, saved variation count, and overall course-unit completion.
- Study buttons load the next opening in a stage or scroll to the board puzzle lab.
- Progress is derived from local training history and solved puzzle IDs; it does not claim engine-certified mastery.


## V3.14 — Personal Study Notes

- Adds per-variation notes saved locally by variation ID.
- Notes can be saved, copied, or cleared; text is limited to 3,000 characters.
- Notes are escaped before rendering back into the textarea.
- Reset progress also removes saved study notes.


## V3.15 — Opening Data Health

- Adds a validation dashboard for stored opening move sequences, curated variations, and configured board-puzzle solutions.
- Reports failed items with their sequence and validation reason.
- Clearly distinguishes legal-move/goal checks from chess-engine analysis or theoretical quality.


## V3.16 — Progress Backup / Restore

- Adds JSON backup export for local stats, repertoire, saved lines, variation progress, review cards, study notes, puzzle progress, and mastered keys.
- Adds schema-checked restore with confirmation before replacing local data.
- Backup is copied into the text area and clipboard when permitted; users should save it privately.
- Restore accepts only the app's versioned backup format and checks expected data types before writing.


## V3.17 — Keyboard Accessibility

- Makes main-board squares focusable and operable with Enter/Space.
- Adds arrow-key movement between visually adjacent squares, accounting for board flip.
- Adds descriptive accessible names for squares/pieces and live position status.
- Adds visible focus outlines for controls.


## V3.18 — Local Data Recovery

- Adds safe localStorage JSON parsing with type checks and fallback defaults.
- Malformed or type-mismatched progress data no longer crashes initial state construction.
- Corrupted entries are logged to the developer console and ignored for that read; the original stored bytes are not automatically deleted.


## V3.19 — Variation Expansion Pack

- Adds twelve additional curated lines across the Italian, Ruy Lopez, Sicilian, French, Caro-Kann, Scandinavian, Queen's Gambit Declined, King's Indian, Grünfeld, Nimzo-Indian, English, and London families.
- Lines are intended as study examples and are subject to the in-app legal-sequence report; they are not engine-certified best-move claims.


## V3.20 — Personal PGN Lines

- Adds a save-current-game action to create a named custom study line from the main board's move history.
- Custom lines are replay-validated from the standard starting position before saving/loading.
- Adds a custom-line queue with load/delete actions.
- Custom lines can be rehearsed, reviewed in the Variation Lab, saved to the personal saved-line queue, and exported as PGN.
- Custom lines are included in progress backup/restore.


## V3.21 — Position-Based Transposition Explorer

- Adds position matching across curated and custom study lines.
- Matches use the first four FEN fields (piece placement, side to move, castling rights, en-passant square) and ignore move counters.
- Allows jumping to a matching position reached through a different SAN move order.
- Prefix branch exploration now includes custom PGN lines.
- Matching is based on exact position state, not engine evaluation or strategic equivalence.


## V3.22 — Green Board & Original Pieces

- Replaces the cream/brown board with a classic green/ivory palette.
- Adds original local SVG artwork for all twelve piece/color combinations; these are not Chess.com assets.
- Highlights the last move and adds a subtle arrival animation on the destination piece.
- Adds desktop drag-and-drop while preserving tap/click-to-move.
- Adds a promotion picker for queen, rook, bishop, or knight.
- Updates puzzle and rehearsal boards to use the same board colors and SVG pieces.


## V3.23 — Position-Specific Annotations

- Adds a note field for the exact selected ply of a curated or custom study line.
- Position notes are stored independently from whole-line notes, so different positions in the same line can have different annotations.
- Notes are included in the versioned progress backup and cleared by Reset Progress.


## V3.24 — Stockfish Analysis (CDN-backed)

- Adds an engine analysis panel with configurable search depth, stop control, score display, best move, and principal variation in SAN.
- Uses a local Web Worker loader that fetches Stockfish.js 19 lite single-threaded JS/WASM from jsDelivr at runtime.
- Engine analysis requires internet access and a browser/WebView that permits Worker, importScripts, WebAssembly, and cross-origin CDN loading.
- This integration is not fully offline and has not been verified in an actual browser/Android runtime here.
- Stockfish.js is GPL-3.0; see LICENSE_STOCKFISH.md and the upstream package source.


## V3.25 — Full Repertoire PGN Export

- Exports saved opening repertoire entries, saved variation lines, and custom PGN study lines as a multi-game PGN bundle.
- Deduplicates by line ID and skips any sequence that fails local legality validation.
- Places the bundle in the PGN text area and copies it when clipboard access is available.


## V3.26 — Engine UCI Stability

- Refactors Stockfish message handling into one UCI event handler instead of stacking per-search listeners.
- Adds an explicit readiness barrier before each new search and ignores stale best-move replies during a restart.
- Resets analysis controls on worker load failures and stop requests.
- CDN/WebAssembly loading remains environment-dependent and still requires actual browser/Android testing.


## V3.27 — Engine Diagnostics

- Adds a Check Engine control and a bounded UCI message log.
- Displays the engine-reported name when the worker identifies itself.
- Logs commands sent to the worker and responses received, with a 40-line cap.
- Helps diagnose CDN/WASM/WebView loading problems; it does not itself guarantee the engine can load.


## V3.28 — Opening Mastery Analytics

- Adds opening-family filters for e4, d4, flank/other, and all opening entries.
- Summarizes practice attempts, accuracy, completed practice thresholds, and saved repertoire counts.
- Per-opening rows show practice status and provide a Study shortcut.
- Completion remains a local practice metric, not engine-certified chess strength.


## V3.29 — Android Release Preparation

- Bumps Android `versionCode` to 29 and `versionName` to 3.29.0.
- Adds a Python script to verify that the Android WebView asset mirror exactly matches web source assets, including SVG pieces and the engine loader.
- Adds a release checklist and documents online runtime dependencies.
- This is Android Studio source, not a compiled APK.


## V3.30 — Release Candidate QA

- Bumps Android version metadata to 3.30.0 / versionCode 30.
- Adds `qa/verify_project.py` to check JavaScript syntax, JSON/XML/SVG parsing, unique content IDs, service-worker precache files, and Android asset mirrors.
- The checker is static QA only; it does not replace browser, device, or Stockfish runtime testing.

Run from the project root: `python qa/verify_project.py` (requires Python 3 and Node.js).


## V3.31 — Data Schema Hardening

- Normalizes saved repertoire IDs, custom lines, line progress, review cards, notes, puzzle attempts, puzzle review cards, and statistics at startup.
- Rejects malformed custom study lines and verifies that their move sequence replays legally before rendering them.
- Fixes saved-line queue support for custom PGN lines, including loading custom lines from the saved-line list.
- Backup restore remains versioned; normalized state is applied after reload.


## V3.31 — Data Schema Hardening

- Sanitizes local progress objects and validates custom PGN lines before rendering.
- Custom study lines are limited to 500 plies and must replay legally from the standard starting position.
- Fixes saved-line queue loading for custom PGN lines.
- Updates Android metadata to 3.31.0 / versionCode 31.
- Extends the static QA script with regression checks for schema normalization and custom-line loading.


## V3.32 — Board Puzzle Expansion

- Expands the board-based puzzle collection from four to ten positions.
- Adds mirrored queen mates, a second checking promotion, a queen capture, a rook capture, and a king-activity endgame position.
- Each configured solution is checked at runtime by the Data Health panel against its declared goal.
- Positional endgame moves are labeled as training concepts, not engine-certified best moves.


## V3.33 — Opening Traps & Mate Patterns

- Adds Scholar's Mate and Fool's Mate as board-based mate-in-one puzzles.
- Adds curated study lines for Scholar's Mate, Fried Liver Attack, and a Two Knights tactical line.
- The trap examples are for pattern recognition and defensive awareness, not claims that the lines are reliable winning systems.
- Android metadata is 3.33.0 / versionCode 33.


## V3.34 — Opening Family Coverage Expansion

- Adds ten curated lines across the Ruy Lopez Berlin, Sicilian Dragon, Caro-Kann Advance, French Winawer, Queen's Gambit Accepted, King's Indian Classical, Grünfeld Exchange, Nimzo-Indian Classical, English Four Knights, and Scandinavian.
- The Data Health panel can check legal replay at runtime; these lines are not engine-certified best moves.
- Android metadata is 3.34.0 / versionCode 34.


## V3.35 — Curriculum Coverage Map

- Adds a per-opening coverage map showing stored variation count, longest stored line in plies, and the line that reaches that depth.
- Adds filters for e4, d4, flank/other, and all opening families.
- Clearly labels counts as library coverage rather than exhaustive opening theory.
- Android metadata is 3.35.0 / versionCode 35.


## V3.36 — Annotated PGN Export

- Full repertoire and active-variation PGN exports now include line-level notes/ideas as comments.
- Position-specific notes are attached to the position after the corresponding ply.
- Exported PGNs can carry the study annotations into compatible chess analysis tools.
- Android metadata is 3.36.0 / versionCode 36.


## V3.37 — PGN Comment Import

- Reports when imported PGN contains comments.
- When a commented PGN is saved as a custom study line, maps comments to positions by replaying the line from the standard starting position.
- Imported comments become position-specific notes and are included in annotated PGN export.
- Non-standard starting-position PGNs that cannot replay from the standard start remain unsupported as full opening lines.
- Android metadata is 3.37.0 / versionCode 37.


## V3.38 — Browser Chess Data Smoke Test

- Adds `qa/chess-data-smoke-test.html`, which replays all opening/variation SAN sequences and validates each puzzle's declared solution goal using the same chess.js version as the app.
- Run a local server from the project root with `python -m http.server 8000`, then open `http://localhost:8000/qa/chess-data-smoke-test.html`.
- The harness requires internet access for chess.js and reports illegal lines/puzzle goal mismatches in a table. It checks legality and declared goals, not strategic quality.
- Android metadata is 3.38.0 / versionCode 38.


## V3.39 — Browser Smoke Test Reliability

- Changes the content smoke-test harness to dynamic dependency loading with a 12-second timeout.
- If chess.js/CDN or local modules fail to load, the page now displays a clear failure row instead of remaining on “Running checks”.
- Android metadata is 3.39.0 / versionCode 39.


## V3.40 — Custom Line Spaced Review

- Custom PGN lines now participate in due-review selection and spaced repetition.
- When a custom line is active, the trainer prioritizes due cards for that line; otherwise the normal review queue remains available.
- Deleting a custom line also removes its saved review cards, line progress, line note, position notes, and repertoire reference.
- Android metadata is 3.40.0 / versionCode 40.


## V3.41 — Startup Dependency Diagnostics

- Adds a visible startup warning if the core app module does not signal readiness within eight seconds or a module error/rejection is raised.
- Adds a Reload action so CDN/module initialization failures are not left as a silent, inert page.
- Android metadata is 3.41.0 / versionCode 41.


## V3.42 — PGN Round-Trip QA

- Extends the browser smoke-test harness with a PGN export/import round-trip check for move history and two position comments.
- Reports whether annotated PGN comments survive the current chess.js runtime's export/import cycle.
- Android metadata is 3.42.0 / versionCode 42.


## V3.43 — Save Engine Analysis to Notes

- Adds a button to save the latest completed engine result to study notes.
- If the analyzed FEN matches the selected line's current ply, the result is attached to that position note; otherwise it is appended to the line-level note with its FEN.
- Saves evaluation, best move, principal variation, depth, and FEN.
- Android metadata is 3.43.0 / versionCode 43.


## V3.44 — Local-First Engine Loader

- Stockfish worker first tries local files named `engine/stockfish-19-lite-single.js` and `engine/stockfish-19-lite-single.wasm`.
- If the local JavaScript file is absent, it falls back to the configured jsDelivr CDN.
- The engine binaries are still not bundled in this archive; adding both compatible upstream files allows a local/offline-first attempt, subject to browser/WebView support and licensing.
- The engine panel reports whether the worker selected local or CDN assets.
- Android metadata is 3.44.0 / versionCode 44.


## V3.45 — APK Build Pipeline

- Adds `android/build-apk.sh` for environments with Gradle and Android SDK configured.
- Adds `.github/workflows/android-debug-apk.yml` to run static QA, build a debug APK, and upload it as a workflow artifact.
- To use GitHub Actions, place the contents of this project folder at the repository root, push the repository, open Actions, select “Chess Opening Academy Android Debug APK”, and choose “Run workflow”.
- This archive still does not contain a compiled APK.
- Android metadata is 3.45.0 / versionCode 45.


## V3.46 — Clean Distribution Package

- The ZIP is structured as a single `Chess-Opening-Academy/` folder instead of nested project folders.
- Adds `CURRENT_VERSION.txt`, `PROJECT_STATUS.md`, and `NEXT_STEPS.md` for handoff and build instructions.
- Android metadata is 3.46.0 / versionCode 46.
