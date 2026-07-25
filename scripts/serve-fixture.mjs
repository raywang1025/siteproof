import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtureRoot = join(projectRoot, "fixtures", "broken-site");
const port = Number(process.env.SITEPROOF_FIXTURE_PORT || 4173);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png"
};

const server = createServer((request, response) => {
  const requestedPath = decodeURIComponent(new URL(request.url, `http://127.0.0.1:${port}`).pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  let filePath = join(fixtureRoot, safePath);
  if (filePath.endsWith("/") || (existsSync(filePath) && statSync(filePath).isDirectory())) {
    filePath = join(filePath, "index.html");
  }

  if (!filePath.startsWith(fixtureRoot) || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Fixture resource intentionally not found.");
    return;
  }

  response.writeHead(200, {
    "content-type": mime[extname(filePath)] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SiteProof fixture: http://127.0.0.1:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
