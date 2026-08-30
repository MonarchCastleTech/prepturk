import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.argv[2] ?? "site");
const requiredFiles = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "favicon.ico",
  "assets/style.css",
  "assets/app.mjs",
  "assets/data.mjs",
  "assets/prepturk-logo.png",
];

for (const relativePath of requiredFiles) {
  const path = resolve(root, relativePath);
  assert.ok(path.startsWith(`${root}${sep}`) || path === root, `unsafe path: ${relativePath}`);
  assert.ok(existsSync(path) && statSync(path).isFile(), `missing file: ${relativePath}`);
  assert.ok(statSync(path).size > 0, `empty file: ${relativePath}`);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");
for (const marker of [
  '<html lang="tr">',
  "PrepTürk | Çevrimdışı Acil Hazırlık Alanı",
  "Türkiye'de tek acil çağrı numarası: 112",
  "Hane hazırlık kaydı",
  "Kaynak ve güncellik",
  "Otomatik veri, sensör, hava durumu veya “canlı” risk iddiası yoktur.",
]) assert.ok(html.includes(marker), `missing content marker: ${marker}`);

assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i, "third-party script dependency found");
const stylesheetTags = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map((match) => match[0]);
for (const tag of stylesheetTags) assert.doesNotMatch(tag, /href=["']https?:\/\//i, "third-party stylesheet dependency found");
assert.doesNotMatch(html, /(?:src|href)=["']\//i, "root-absolute asset path breaks project Pages");
assert.doesNotMatch(html, /(?:sk-[A-Za-z0-9_-]{12,}|Bearer\s+[A-Za-z0-9._-]+)/i, "credential-like value found");

const localReferences = [...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)]
  .map((match) => match[1])
  .filter((reference) => !/^(?:https?:|tel:|mailto:)/i.test(reference));
for (const reference of localReferences) {
  const path = resolve(root, reference);
  assert.ok(path.startsWith(`${root}${sep}`), `local reference escapes site: ${reference}`);
  assert.ok(existsSync(path), `broken local reference: ${reference}`);
}

const manifest = JSON.parse(readFileSync(resolve(root, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.lang, "tr");
assert.equal(manifest.start_url, "./");
assert.equal(manifest.scope, "./");
assert.equal(manifest.display, "standalone");

const worker = readFileSync(resolve(root, "sw.js"), "utf8");
const precacheBlock = worker.match(/const PRECACHE = \[([\s\S]*?)\];/)?.[1] ?? "";
const precachePaths = [...precacheBlock.matchAll(/["']\.\/([^"']*)["']/g)].map((match) => match[1] || "index.html");
assert.ok(precachePaths.length >= 8, "offline precache is incomplete");
for (const relativePath of precachePaths) {
  assert.ok(existsSync(resolve(root, relativePath)), `precache target missing: ${relativePath}`);
}

const dataUrl = pathToFileURL(resolve(root, "assets/data.mjs")).href;
const { GUIDANCE, PROVINCES, SOURCES } = await import(dataUrl);
assert.equal(PROVINCES.length, 81);
assert.ok(GUIDANCE.length >= 8);
assert.ok(SOURCES.length >= 6);

console.log(`Pages site valid: ${requiredFiles.length} assets, ${GUIDANCE.length} guides, ${PROVINCES.length} provinces, ${SOURCES.length} official sources.`);
