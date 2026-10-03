# Chess Opening Academy — Project Status

## Current package
- Version: 3.46.0 (Android versionCode 46)
- Project type: mobile-first web app + Android WebView source
- This ZIP contains source code, QA tools, and APK build automation. It does **not** contain a compiled APK.

## Current implemented areas
- 30 opening entries and 55 curated variation lines.
- Opening-family coverage map and practice analytics.
- Board-based puzzle pack with 12 configured positions.
- Green/ivory board, original SVG piece set, legal-move UI, last-move highlight, drag/tap interaction, and promotion picker.
- Variation study notes and position-specific notes.
- PGN import/export, annotated PGN export, and comment import mapping when supported by chess.js.
- Spaced review for curated lines and custom PGN lines.
- Data normalization for stored progress and custom study lines.
- Stockfish UCI analysis interface, diagnostics, local-first loader, and CDN fallback.
- Static QA script, browser chess-data smoke-test page, Android asset mirror checker, and GitHub Actions debug-APK workflow.

## Known limitations / not yet verified
- Stockfish JS/WASM binaries are not bundled; engine loading depends on local files being added or CDN access.
- The browser chess-data smoke test has not completed in this environment.
- The GitHub Actions workflow has not been executed, and no APK has been compiled here.
- Actual phone testing for board interaction, Android WebView, promotion, PGN round-trip, and engine startup remains pending.
- Opening lines and puzzle positions have not been independently certified by Stockfish.
- The curriculum is broad but not exhaustive opening theory.
