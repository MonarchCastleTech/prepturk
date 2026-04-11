# PrepTurk Polish + Branding + Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish PrepTurk's product surface, create a release-grade logo, overhaul the README, and publish the project to GitHub in a state that feels coherent and deliberate.

**Architecture:** Work in four passes: audit and tighten the shared shell, polish the highest-visibility routes and copy system, create and integrate the real brand assets, then package the repo for public release with a rewritten README and GitHub setup. Treat Gemini as a brand-concept generator and convert the result into repo-safe assets rather than shipping raw generated output blindly.

**Tech Stack:** Next.js 15 app router, React 19, TypeScript, Tailwind CSS, Zustand, Jest, Testing Library, Playwright/browser MCP, Git/GitHub, Gemini via browser automation, Markdown docs.

---

Repository notes:

- The current workspace is not a git repository. GitHub publication requires `git init` or connecting to an existing repo.
- Local browser checks have shown backend-dependent routes failing when `localhost:8000` is unavailable. Final screenshot/release QA should happen with the backend running.

### Task 1: Create a release audit inventory

**Files:**
- Modify: `docs/plans/2026-04-10-prepturk-polish-release-design.md`
- Create: `docs/plans/2026-04-10-prepturk-release-audit.md`
- Read: `README.md`
- Read: `apps/web/app/layout.tsx`
- Read: `apps/web/components/Chrome.tsx`
- Read: `apps/web/components/TopBar.tsx`
- Read: `apps/web/components/Sidebar.tsx`

**Step 1: Inventory top-level routes and release surfaces**

List the public/release-critical surfaces:

- shared shell
- dashboard
- documents
- search
- maps
- province packs
- ai chat
- vault
- notes
- root README
- logo assets
- GitHub metadata

**Step 2: Record visible problems**

Write a short audit doc with:

- hierarchy issues
- spacing/layout issues
- copy inconsistencies
- missing/weak empty states
- placeholder branding
- repo publication blockers

**Step 3: Validate the audit against the current app**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx components/__tests__/TopBar.test.tsx components/__tests__/Sidebar.test.tsx app/__tests__/dashboard-shell.test.tsx app/__tests__/documents-page.test.tsx app/__tests__/search-page.test.tsx
```

Expected:

- PASS or targeted failures that match the audit

**Step 4: Save the audit doc**

Capture the release punch list in `docs/plans/2026-04-10-prepturk-release-audit.md`.

### Task 2: Tighten the shared shell and global content rules

**Files:**
- Modify: `apps/web/components/Chrome.tsx`
- Modify: `apps/web/components/TopBar.tsx`
- Modify: `apps/web/components/Sidebar.tsx`
- Modify: `apps/web/components/SOSButton.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`
- Test: `apps/web/components/__tests__/Chrome.test.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`

**Step 1: Add or tighten tests for non-redundant shell behavior**

Make sure tests cover:

- top bar as utility/context strip, not page hero
- sidebar as the only primary navigator
- shell spacing tokens
- non-intrusive SOS positioning
- no auto-start tour takeover on initial paint

**Step 2: Run the focused shell suite**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx components/__tests__/TopBar.test.tsx components/__tests__/Sidebar.test.tsx
```

Expected:

- FAIL if new assertions expose remaining shell drift

**Step 3: Implement the shell cleanup**

Update the shell so:

- top bar only carries global context, search, and actions
- repeated route titles do not appear in both shell and page body
- spacing tokens are aligned with the actual bar height
- SOS is visually present but not dominant
- global metadata/title copy is clean and consistent

**Step 4: Re-run the shell suite**

Use the same command and confirm green.

### Task 3: Polish the release-critical routes

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/documents/page.tsx`
- Modify: `apps/web/app/search/page.tsx`
- Modify: `apps/web/app/maps/page.tsx`
- Modify: `apps/web/app/province-packs/page.tsx`
- Modify: `apps/web/app/ai-chat/page.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Modify: `apps/web/app/notes/page.tsx`
- Modify tests under: `apps/web/app/__tests__/`

**Step 1: Extend route smoke coverage**

Add or update tests so each critical route asserts:

- one clear page-level heading
- no duplicate hero hierarchy under the shell
- a valid empty/loading/result state
- consistent section naming

**Step 2: Run targeted route suites**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/dashboard-shell.test.tsx app/__tests__/documents-page.test.tsx app/__tests__/search-page.test.tsx app/__tests__/interior-workspaces.test.tsx app/__tests__/province-packs.test.tsx app/__tests__/maps-hydration.test.tsx
```

Expected:

- FAIL where the remaining routes still use inconsistent hierarchy or copy

**Step 3: Implement the route polish pass**

For each release-critical route:

- remove nested homepage-like hero blocks
- keep page headings short and task-specific
- normalize section labels and empty states
- reduce stacked borders/boxes where they create visual nesting noise
- keep business logic intact

**Step 4: Re-run the route suites**

Use the same command and confirm green.

### Task 4: Normalize product copy and content quality

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/components/TopBar.tsx`
- Modify: route files under `apps/web/app/**/page.tsx`
- Modify: `FEATURES.md`
- Modify: `README.md`

**Step 1: Define copy rules**

Apply a single release rule:

- Turkish-first UI
- English-first developer docs
- no placeholder shell prose
- no duplicated "Komuta Merkezi" framing across layers

**Step 2: Fix the most visible copy drift**

Normalize:

- Turkish diacritics or ASCII fallback strategy
- title casing
- CTA language
- empty state wording
- microcopy in badges and status chips

**Step 3: Review metadata and manifest wording**

Make sure layout metadata, manifest text, and product descriptors match the README hero language.

### Task 5: Create the real logo via Gemini and integrate it

**Files:**
- Create: `docs/brand/prepturk-logo-brief.md`
- Create: `docs/brand/prepturk-logo-prompt.md`
- Modify or replace: `apps/web/public/logo.svg`
- Create: `apps/web/public/logo-mark.svg`
- Create or replace: `apps/web/public/icon-192.png`
- Create or replace: `apps/web/public/icon-512.png`
- Modify: `apps/web/public/manifest.json`
- Modify: `apps/web/app/layout.tsx`

**Step 1: Write the brand brief**

Document:

- brand attributes
- visual constraints
- colors
- symbol ideas
- typography direction
- what to avoid

**Step 2: Create the Gemini prompt**

Write a prompt that asks for:

- an offline-resilience/preparedness identity
- Turkey-aware but not kitsch visuals
- strong readability at favicon size
- dark UI compatibility
- no generic AI-glow aesthetic

**Step 3: Use Playwright/browser to open Gemini and generate concepts**

Use the logged-in Gemini session to:

- submit the brief
- generate several logo directions
- save the preferred result(s)

If Gemini only returns raster artwork, treat it as concept reference, not final code asset.

**Step 4: Convert the selected concept into product assets**

Produce:

- simplified SVG mark
- horizontal lockup
- app icon exports

**Step 5: Integrate the assets**

Update app metadata and manifest references so the new assets are actually used.

### Task 6: Rewrite the README as a launch-grade repository front page

**Files:**
- Modify: `README.md`
- Optionally modify: `FEATURES.md`
- Optionally create: `docs/screenshots/`

**Step 1: Outline the new README structure**

Use a structure inspired by strong open-source landing READMEs:

- hero
- what this is
- why it exists
- screenshots/product tour
- core capabilities
- architecture
- install/quick start
- offline model
- security/privacy
- differences from alternatives
- roadmap/contributing/license

**Step 2: Keep the substance, rewrite the sequencing**

The current README already has strong information. Improve it by:

- shortening the top section
- moving dense details lower
- improving scanability
- making the first screen more persuasive

**Step 3: Add polished screenshots**

Capture screenshots only after the UI polish pass is complete and the backend is available enough for representative screens.

**Step 4: Review against Project N.O.M.A.D. standards without copying**

Check:

- confidence
- clarity
- visual rhythm
- architecture explanation
- setup readability

Do not mirror wording or copyrighted structure too closely.

### Task 7: Prepare the repo for GitHub publication

**Files:**
- Modify: `.gitignore`
- Modify: `.github/workflows/*.yml` if needed
- Modify: `.github/PULL_REQUEST_TEMPLATE.md` if needed
- Create: `.gitattributes` if needed
- Review: local screenshots and generated artifacts in repo root

**Step 1: Clean repository hygiene**

Add ignore rules for:

- `.playwright-mcp/`
- ad hoc root screenshots if they should not be tracked
- other local-only artifacts created during polish

**Step 2: Review workflows and metadata**

Make sure CI and build workflows still reflect the intended public repo shape.

**Step 3: Decide screenshot policy**

Either:

- move curated screenshots into a dedicated tracked docs/assets folder, or
- keep them untracked and generate fresh release images

### Task 8: Initialize git, connect GitHub, and publish

**Files:**
- Modify: none required
- Review: all changed files

**Step 1: Initialize the repository**

Run:

```bash
git init
git branch -M main
```

Expected:

- local git repository created

**Step 2: Stage only release-ready files**

Run:

```bash
git add README.md .github apps docs FEATURES.md LICENSE Makefile docker-compose.yml .gitignore
```

Adjust the set if backend or infra files also changed during polish.

**Step 3: Create the initial publish commit**

Run:

```bash
git commit -m "feat: polish PrepTurk for public release"
```

**Step 4: Add the GitHub remote**

Run:

```bash
git remote add origin <github-repo-url>
git push -u origin main
```

Expected:

- repo published to GitHub

**Step 5: Verify the public repo page**

Check:

- README renders correctly
- logo and screenshots display
- badges are valid
- workflows appear
- repository name and description fit the README hero

### Task 9: Final verification pass

**Files:**
- Modify: none

**Step 1: Run the full targeted frontend suite**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx components/__tests__/TopBar.test.tsx components/__tests__/Sidebar.test.tsx app/__tests__/dashboard-shell.test.tsx app/__tests__/page.test.tsx app/__tests__/documents-page.test.tsx app/__tests__/search-page.test.tsx app/__tests__/interior-workspaces.test.tsx app/__tests__/province-packs.test.tsx app/__tests__/maps-hydration.test.tsx
```

Expected:

- PASS on the release-critical UI suite

**Step 2: Run manual browser verification**

With the backend available, verify:

- `/dashboard`
- `/documents`
- `/search`
- `/maps`
- `/province-packs`
- `/ai-chat`
- mobile drawer behavior
- search states
- logo integration in the shell and browser metadata

**Step 3: Verify the GitHub landing page**

Open the published repo and confirm:

- README readability
- screenshot quality
- brand asset rendering
- no accidental local junk committed
