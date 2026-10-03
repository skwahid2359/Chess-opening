# Android app project

This is the Android Studio source wrapper for Chess Opening Academy. It loads the included web app from local Android assets.

## Build an APK
1. Install Android Studio and Android SDK Platform 35.
2. Open the `android/` folder in Android Studio.
3. Allow Gradle sync to complete.
4. Choose **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. The debug APK is normally written to `android/app/build/outputs/apk/debug/app-debug.apk`.

## Important limitation
The app currently imports `chess.js` from jsDelivr and queries the Lichess Masters Explorer online. Internet access is needed for those functions. This source archive is not itself a compiled APK; compilation needs Android SDK/Gradle tooling.


## V3.29 release preparation notes
- Android `versionCode` is 29 and `versionName` is 3.29.0.
- Verify the launcher icon, app label, splash/status/navigation bars, and board layout on a real phone before distribution.
- The Stockfish panel currently fetches its JS/WASM engine from a CDN at runtime; it is not bundled/offline.
- The app also depends on the configured CDN for chess.js and on the internet for the Lichess Masters Explorer.
- Run the asset mirror checker before building so the Android WebView copy matches the web source.


## V3.30 release candidate
Run `python verify-assets.py` from `android/` or `python qa/verify_project.py` from the project root before building. Android version metadata is 3.30.0 (versionCode 30). Static QA is not a substitute for testing on an actual phone.


## V3.31 schema-hardening build
Android metadata is now 3.31.0 (versionCode 31). Run `python qa/verify_project.py` from the project root before compiling.


## V3.32 puzzle expansion
Android metadata is 3.32.0 (versionCode 32). The board puzzle collection now contains ten configured positions.


## V3.33 opening trap patterns
Android metadata is 3.33.0 (versionCode 33). The puzzle collection now includes Fool's Mate and Scholar's Mate patterns.


## V3.34 opening coverage
Android metadata is 3.34.0 (versionCode 34). The curated variation collection now contains 55 lines.


## V3.35 curriculum coverage
Android metadata is 3.35.0 (versionCode 35). The Opening Coverage Map reports actual stored lines and ply depth per opening.


## V3.36 annotated PGN
Android metadata is 3.36.0 (versionCode 36). PGN exports now include study comments when notes exist.


## V3.37 PGN comments
Android metadata is 3.37.0 (versionCode 37). PGN comments can be mapped to position notes when saving a standard-start game as a custom line.


## V3.38 content smoke test
Android metadata is 3.38.0 (versionCode 38). To validate opening and puzzle data in a browser, run `python -m http.server 8000` from the project root and open `/qa/chess-data-smoke-test.html`.


## V3.39 smoke-test fallback
Android metadata is 3.39.0 (versionCode 39). The browser smoke-test page reports dependency timeouts clearly when CDN access is unavailable.


## V3.40 custom-line review
Android metadata is 3.40.0 (versionCode 40). Custom study lines now use the same due-review scheduling flow as curated lines.


## V3.41 startup diagnostics
Android metadata is 3.41.0 (versionCode 41). If core module/CDN loading fails, the app now displays a startup warning and reload button.


## V3.42 PGN round-trip test
Android metadata is 3.42.0 (versionCode 42). The browser smoke test now checks annotated PGN export/import round-trip as well as legal lines and puzzle goals.


## V3.43 engine notes
Android metadata is 3.43.0 (versionCode 43). Completed engine analysis can be saved into line-level or position-specific study notes.


## V3.44 local engine option
Android metadata is 3.44.0 (versionCode 44). If compatible Stockfish.js 19 lite JS/WASM assets are placed in the `engine/` directory, the loader tries them locally before CDN fallback. The assets are not included by default.


## V3.45 build automation
Android metadata is 3.45.0 (versionCode 45). Use `./build-apk.sh` when Gradle and Android SDK are installed, or use the repository's GitHub Actions workflow to build and upload a debug APK artifact. The workflow must be run after the project contents are placed at the repository root.


## V3.46 clean package
Android metadata is 3.46.0 (versionCode 46). The archive now extracts into a single project folder. See `PROJECT_STATUS.md` and `NEXT_STEPS.md` for current limitations and verification instructions.
