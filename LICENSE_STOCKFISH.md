Stockfish.js engine dependency notice

This project optionally loads Stockfish.js 19 lite single-threaded engine assets from jsDelivr at runtime. Stockfish.js is distributed under GPL-3.0.

Upstream package: https://www.npmjs.com/package/stockfish
Upstream repository: https://github.com/nmrugg/stockfish.js

The engine binary is not bundled in this archive. When distributing a build that includes or relies on the engine, review the GPL-3.0 terms and include the applicable license/source notices.


Optional local engine asset filenames expected by V3.44:
- `engine/stockfish-19-lite-single.js`
- `engine/stockfish-19-lite-single.wasm`

These files are not included in this archive. The loader falls back to the configured CDN when the local JavaScript asset is absent.
