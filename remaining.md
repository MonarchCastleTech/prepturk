# Remaining Work

## 1. Offline release packaging is still incomplete

- Current web app still expects a separate API process at `http://localhost:8000`.
- If that process is not running, `documents`, `search`, and other data-backed pages render without live data.
- `apps/web` is built with `output: 'standalone'`, but the current start script still uses `next start`, which is not the right packaged runtime flow for the standalone output.

Files:
- [apps/web/lib/api.ts](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/lib/api.ts#L1)
- [apps/web/next.config.ts](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/next.config.ts#L4)
- [apps/web/package.json](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/package.json#L9)

What needs to happen:
- Define a real local runtime contract for packaged releases.
- Ensure web, API, worker, docs, and model start together with no manual setup.
- Replace the current ad hoc localhost dependency with the packaged local app flow.

## 2. First-run tour still has broken and outdated Turkish

- The tour overlay still shows old copy like `PrepTurk'e Hos Geldiniz!`, `AI Asistan`, and `Ileri`.
- This is visible immediately and breaks the polish of the redesigned shell.

File:
- [apps/web/lib/tour.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/lib/tour.tsx#L19)

What needs to happen:
- Rewrite the entire tour in proper Turkish.
- Align titles and descriptions with the new command-center language.
- Remove old "AI" branding in favor of `Yapay Zeka Asistanı` or the chosen final naming.

## 3. AI chat page is still visually and linguistically behind

- `AI chat` still uses old UI copy and broken Turkish.
- Examples: `AI Asistan`, `cevrimdisi asistan`, `Cocuk Guvenli`, `15 Yas Aciklama`, `Dusunuyor...`
- It does not yet feel like the same product family as the redesigned interior pages.

File:
- [apps/web/app/ai-chat/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/ai-chat/page.tsx#L81)

What needs to happen:
- Redesign this page into the same shell/workspace pattern.
- Fix all Turkish copy.
- Expose `Qwen 0.5B` clearly where appropriate.

## 4. Setup flow still conflicts with the product direction

- Setup still has old/broken Turkish and a more technical/dev-facing tone.
- It still talks in terms like `hostname`, `LAN`, and low-level module selection in a way that does not match the "download and just use it" goal.
- It needs a product pass, not just a text cleanup.

File:
- [apps/web/app/setup/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/setup/page.tsx#L17)

What needs to happen:
- Reframe setup around local readiness and optional device preferences.
- Remove unnecessary technical friction for end users.
- Rewrite all Turkish and bring the visual style in line with the command center.

## 5. Document detail page still uses the old interface language

- The document detail route was not redesigned with the rest of the library surfaces.
- Old copy remains: `Onizleme`, `Cikarilan Metin`, `AI Ozeti`, `Belge bulunamadi`, etc.
- The page does not match the new `documents` list experience.

File:
- [apps/web/app/documents/[id]/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/documents/[id]/page.tsx#L34)

What needs to happen:
- Redesign detail view to match the new command-center document language.
- Fix Turkish copy and metadata presentation.
- Revisit the AI summary tab wording and behavior.

## 6. Several secondary pages still contain old ASCII Turkish

- The redesigned pages are now consistent, but some lower-priority routes still contain old ASCII or outdated labels.
- Notable examples:
  - [apps/web/app/admin/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/admin/page.tsx#L83)
  - [apps/web/app/education/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/education/page.tsx#L55)
  - [apps/web/app/notes/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/notes/page.tsx#L224)
  - [apps/web/app/vault/page.tsx](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/app/vault/page.tsx#L113)

What needs to happen:
- Run a second full copy cleanup pass on the remaining routes.
- Bring these pages into the same visual system used by `documents`, `search`, `sinav`, `saglik`, `maps`, and `acil`.

## 7. Verification status at handoff

Completed before this note:
- `npm test -- --runInBand` passed in `apps/web`
- `npm run build` passed in `apps/web`
- Browser checks passed for `/sinav`, `/saglik`, and `/maps`
- `maps` hydration/runtime issue was fixed and covered by test

Important context:
- `/documents` layout is correct, but seeing real data still depends on the local API process being available.
