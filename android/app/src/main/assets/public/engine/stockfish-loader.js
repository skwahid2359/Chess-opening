/* Local-first Stockfish.js 19 lite single-threaded loader with CDN fallback. */
const ENGINE_BASE = "https://cdn.jsdelivr.net/npm/stockfish@19.0.0/";
try {
  self.Module = self.Module || {};
  self.Module.locateFile = function (path) { return new URL(path, self.location.href).href; };
  importScripts("./stockfish-19-lite-single.js");
  self.postMessage("ENGINE_SOURCE local");
} catch (localError) {
  try {
    self.Module = {};
    self.Module.locateFile = function (path) { return new URL(path, ENGINE_BASE).href; };
    importScripts(ENGINE_BASE + "stockfish-19-lite-single.js");
    self.postMessage("ENGINE_SOURCE cdn");
  } catch (remoteError) {
    self.postMessage("ENGINE_LOAD_ERROR local: " + String(localError && localError.message || localError) + "; cdn: " + String(remoteError && remoteError.message || remoteError));
  }
}
