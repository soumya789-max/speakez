import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const candidates = [
  path.join(webRoot, "node_modules/@mediapipe/tasks-vision/wasm"),
  path.join(webRoot, "../../node_modules/@mediapipe/tasks-vision/wasm"),
];
const src = candidates.find((p) => fs.existsSync(p));
if (!src) {
  console.warn("[sync-mediapipe-wasm] @mediapipe/tasks-vision wasm not found; skip");
  process.exit(0);
}

const dest = path.join(webRoot, "public/mediapipe/wasm");
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log("[sync-mediapipe-wasm] copied to public/mediapipe/wasm");
