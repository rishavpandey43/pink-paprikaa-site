/**
 * A tiny static file server for `storybook-static/`, used by Playwright's `webServer`.
 *
 * No `npx`/`serve` indirection: Node's own `http` is enough for a static export, starts instantly,
 * and has no dependency that could change what the snapshots render. Usage:
 *
 *   node serve.mjs [directory] [port]
 */
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(process.argv[2] ?? join(here, "..", "storybook-static"));
const port = Number(process.argv[3] ?? process.env.VISUAL_PORT ?? 6107);

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  // Resolve inside `root` and refuse anything that escapes it (`..`, encoded separators).
  const target = normalize(join(root, decoded));
  if (target !== root && !target.startsWith(root + sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  let file = target;
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    statSync(file);
  } catch {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`serving ${root} on http://127.0.0.1:${port}`);
});
