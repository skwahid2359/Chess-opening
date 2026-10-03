# Next Steps

## 1. Run static checks
From the project root:

```sh
python qa/verify_project.py
python android/verify-assets.py
```

## 2. Run browser chess-content checks
Start a local server from the project root:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/qa/chess-data-smoke-test.html`. Internet is required for chess.js from the CDN. Check all opening lines, variations, puzzle goals, and PGN comment round-trip results.

## 3. Build the Android debug APK
If Gradle and Android SDK are installed, run:

```sh
cd android
./build-apk.sh
```

Alternatively, push the project folder contents to a GitHub repository, then open **Actions → Chess Opening Academy Android Debug APK → Run workflow**. The workflow is configured to upload `app-debug.apk` as an artifact.

## 4. Test on a real phone
Verify startup, board orientation, tap/drag moves, promotion selection, line navigation, PGN import/export, spaced review, and engine analysis.

## 5. Optional local Stockfish assets
The local-first engine loader expects compatible Stockfish.js 19 lite files named `engine/stockfish-19-lite-single.js` and `engine/stockfish-19-lite-single.wasm`. They are not included in this package. Review `LICENSE_STOCKFISH.md` before redistributing engine assets.
