// Assembles the Next.js `output: 'standalone'` bundle into a self-contained
// runnable directory. Next emits a minimal server in `.next/standalone` but does
// NOT copy the static assets or the public/ folder — this script does, so that
// `node .next/standalone/server.js` works with zero extra setup (the offline
// "download and just run it" goal). Cross-platform (pure Node fs APIs).

import { existsSync, cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const standalone = join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error(
    '[package-standalone] .next/standalone not found. Run `next build` with `output: "standalone"` first.'
  );
  process.exit(1);
}

function copyInto(srcRel, destRel) {
  const src = join(root, srcRel);
  if (!existsSync(src)) {
    console.warn(`[package-standalone] skip (missing): ${srcRel}`);
    return;
  }
  const dest = join(standalone, destRel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`[package-standalone] copied ${srcRel} -> .next/standalone/${destRel}`);
}

copyInto('public', 'public');
copyInto(join('.next', 'static'), join('.next', 'static'));

console.log('[package-standalone] standalone bundle ready: node .next/standalone/server.js');
