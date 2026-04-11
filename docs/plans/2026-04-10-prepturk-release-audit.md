# PrepTurk Release Audit

Date: 2026-04-10

## Verification Baseline

Targeted frontend suite:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx components/__tests__/TopBar.test.tsx components/__tests__/Sidebar.test.tsx app/__tests__/dashboard-shell.test.tsx app/__tests__/documents-page.test.tsx app/__tests__/search-page.test.tsx
```

Result:

- PASS
- 6 suites, 10 tests

This means the shell direction is stable enough to keep iterating on, but it does not mean the release-critical product surface is fully polished.

## Release-Critical Findings

### 1. Shared shell is improved but not fully normalized

Status:

- Better than before
- still needs one final consistency pass

Notes:

- `TopBar.tsx` is now a utility bar, which is correct.
- `Sidebar.tsx` is acceptable structurally, but still heavy in the upper-left stack and footer diagnostics.
- `SOSButton.tsx` is less intrusive than before, but it is still visually loud enough to dominate screenshots if the surrounding route is sparse.

### 2. Dashboard is close, but only that route has the newer hierarchy

Status:

- Acceptable foundation
- not yet representative of the rest of the app

Notes:

- `apps/web/app/dashboard/page.tsx` now reads more cleanly.
- The problem is not just dashboard polish anymore; the rest of the product still does not match that level.

### 3. Documents and Search are partially aligned

Status:

- Functionally acceptable
- visually closer to target than before

Notes:

- `apps/web/app/documents/page.tsx`
- `apps/web/app/search/page.tsx`

These pages now behave more like workspaces than standalone landing pages, but they still need:

- lighter section framing
- cleaner empty/result states
- tighter content density in some blocks

### 4. Maps still uses the old "big hero + metrics + tool stack" pattern

Status:

- below release quality

Primary file:

- `apps/web/app/maps/page.tsx`

Issues:

- large route hero still present
- too many stacked framed blocks before the map itself
- mixed UI language and older panel styling
- route reads like an earlier generation of the product

### 5. Province Packs still uses older hero and card language

Status:

- below release quality

Primary file:

- `apps/web/app/province-packs/page.tsx`

Issues:

- heavy landing-style heading block
- card grid reads informational, not operational
- copy is denser and more generic than the newer shell routes

### 6. AI Chat is visually disconnected from the newer shell

Status:

- below release quality

Primary file:

- `apps/web/app/ai-chat/page.tsx`

Issues:

- older layout pattern based on inline banners, raw control clusters, and generic page scaffolding
- no release-grade empty state hierarchy
- mixed Turkish/English mode copy in the same visual block

### 7. Vault and Notes are from an older UI generation

Status:

- below release quality

Primary files:

- `apps/web/app/vault/page.tsx`
- `apps/web/app/notes/page.tsx`

Issues:

- strong reliance on raw `Card` layout patterns instead of the newer shell panels
- top-of-page composition is inconsistent with dashboard/documents/search
- likely to feel like a separate app when viewed next to the newer routes

### 8. Content language is still mixed across the app

Status:

- release blocker

Examples:

- Turkish-first UI labels in some routes
- English structural labels like `Command workspace`, `Health`, `Snapshot` in others
- ASCII fallback and proper Turkish text are mixed

Required direction:

- Turkish-first product UI
- English-first repo/docs
- operational microcopy only, no duplicated shell slogans

### 9. Brand assets are placeholder-grade

Status:

- release blocker

Current asset:

- `apps/web/public/logo.svg`

Issues:

- reads like a temporary dev logo
- typography is generic
- not obviously app-icon ready
- not yet supported by a full asset family

### 10. README is strong on substance but weak on launch rhythm

Status:

- needs editorial rewrite, not a full rewrite from scratch

Primary file:

- `README.md`

Issues:

- the top section is too dense
- early narrative is strong but slower to scan than it should be
- the document needs a more deliberate hero -> tour -> quickstart flow

### 11. GitHub publication is blocked by missing git repo state

Status:

- hard blocker

Current state:

- `git rev-parse --is-inside-work-tree` fails

Implications:

- no worktree flow available right now
- cannot push to GitHub until repo is initialized and a remote is provided

### 12. Repo hygiene needs cleanup before publication

Status:

- release blocker

Issues:

- many ad hoc screenshots currently exist in repo root
- `.playwright-mcp/` is not in `.gitignore`
- release screenshot policy is not yet defined

## Priority Order

### Priority A

- Normalize shared shell and critical route hierarchy
- Polish `maps`, `province-packs`, `ai-chat`, `vault`, `notes`
- Normalize product copy

### Priority B

- Generate and integrate final logo assets
- Rewrite README into launch-grade structure

### Priority C

- Clean repo hygiene
- Initialize git
- connect GitHub remote
- publish

## Definition Of Release-Ready

PrepTurk is ready for GitHub publication when:

- major routes feel like one product
- screenshots no longer expose mixed UI generations
- logo is deliberate and consistent
- README matches the product's actual quality
- repo is free of accidental local clutter
- git + remote setup is complete
