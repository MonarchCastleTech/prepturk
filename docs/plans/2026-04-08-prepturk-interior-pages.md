# PrepTurk Interior Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign PrepTurk's interior pages so `sinav`, `saglik`, `maps`, `documents`, `search`, `province-packs`, and `acil` feel like one polished, offline command-center product.

**Architecture:** Keep the existing route and data flow structure, but introduce a shared content hierarchy across interior pages: hero, summary metrics, main workspace, and support rail. Use test-first page smoke coverage to lock in the new hierarchy, then update shared cards and individual pages with minimal functional churn.

**Tech Stack:** Next.js 15 app router, React 19, TypeScript, Tailwind CSS, SWR, Zustand, Jest, Testing Library.

---

Repository note:

- The current workspace is not a git repository, so commit steps below are placeholders only.

### Task 1: Add failing smoke tests for the interior page redesign

**Files:**
- Create: `apps/web/app/__tests__/documents-page.test.tsx`
- Create: `apps/web/app/__tests__/search-page.test.tsx`
- Modify: `apps/web/app/__tests__/province-packs.test.tsx`
- Test: `apps/web/app/__tests__/documents-page.test.tsx`
- Test: `apps/web/app/__tests__/search-page.test.tsx`
- Test: `apps/web/app/__tests__/province-packs.test.tsx`

**Step 1: Write the failing tests**

Add page smoke tests that assert the new command-center hierarchy exists.

Example expectations:

```tsx
expect(screen.getByText(/yerel belge komuta merkezi/i)).toBeInTheDocument();
expect(screen.getByText(/resmi kaynak onceligi/i)).toBeInTheDocument();
expect(screen.getByText(/kurulumla hazir il envanteri/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/documents-page.test.tsx app/__tests__/search-page.test.tsx app/__tests__/province-packs.test.tsx
```

Expected:

- FAIL because the new hero and summary copy do not exist yet.

**Step 3: Write minimal implementation**

Only after seeing the failures, update the affected pages with the new hero text and structure.

**Step 4: Run test to verify it passes**

Run the same command and confirm all three tests pass.

**Step 5: Commit**

```bash
git add apps/web/app/__tests__/documents-page.test.tsx apps/web/app/__tests__/search-page.test.tsx apps/web/app/__tests__/province-packs.test.tsx
git commit -m "test: cover interior page hierarchy"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 2: Upgrade shared search and document primitives

**Files:**
- Modify: `apps/web/components/DocumentCard.tsx`
- Modify: `apps/web/components/SearchBar.tsx`
- Test: `apps/web/app/__tests__/documents-page.test.tsx`
- Test: `apps/web/app/__tests__/search-page.test.tsx`

**Step 1: Write the failing test**

Extend the page tests to assert upgraded affordances such as professional metadata labels and command-style search prompts.

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/documents-page.test.tsx app/__tests__/search-page.test.tsx
```

Expected:

- FAIL because the old card/search styling and copy remain.

**Step 3: Write minimal implementation**

Update `DocumentCard` and `SearchBar` so the documents and search workspaces share the same polished interaction style.

**Step 4: Run test to verify it passes**

Run the same tests again and confirm green.

**Step 5: Commit**

```bash
git add apps/web/components/DocumentCard.tsx apps/web/components/SearchBar.tsx
git commit -m "feat: upgrade document and search primitives"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 3: Redesign the document and search workspaces

**Files:**
- Modify: `apps/web/app/documents/page.tsx`
- Modify: `apps/web/app/search/page.tsx`
- Test: `apps/web/app/__tests__/documents-page.test.tsx`
- Test: `apps/web/app/__tests__/search-page.test.tsx`

**Step 1: Write the failing test**

Add assertions for:

- hero titles
- result summaries
- official/trust context
- cleaner empty-state messages

**Step 2: Run test to verify it fails**

Run the two page tests and confirm the expected text is missing.

**Step 3: Write minimal implementation**

Refactor the page structure into:

- hero
- summary cards
- filters rail
- main results

Keep existing hooks and behavior intact.

**Step 4: Run test to verify it passes**

Re-run the two page tests and confirm green.

**Step 5: Commit**

```bash
git add apps/web/app/documents/page.tsx apps/web/app/search/page.tsx
git commit -m "feat: redesign document and search workspaces"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 4: Redesign the exam workspace

**Files:**
- Modify: `apps/web/app/sinav/page.tsx`
- Test: `apps/web/app/__tests__/page.test.tsx`

**Step 1: Write the failing test**

Add or extend a smoke test that expects the exam page to render:

- a Turkish hero
- an active exam summary
- a progress-focused workspace

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/page.test.tsx
```

Expected:

- FAIL once the new exam expectations are added.

**Step 3: Write minimal implementation**

Reorganize `sinav/page.tsx` around:

- active exam hero
- countdown/progress stats
- session controls
- cleaned topic checklist

**Step 4: Run test to verify it passes**

Re-run the targeted test and confirm green.

**Step 5: Commit**

```bash
git add apps/web/app/sinav/page.tsx
git commit -m "feat: redesign exam workspace"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 5: Redesign the health workspace

**Files:**
- Modify: `apps/web/app/saglik/page.tsx`
- Test: `apps/web/components/__tests__/Chrome.test.tsx`

**Step 1: Write the failing test**

Add a health-page smoke test or extend existing coverage to assert:

- emergency summary copy
- Turkish record terminology
- medication/contact grouping

**Step 2: Run test to verify it fails**

Run the targeted web tests and confirm the old structure does not satisfy them.

**Step 3: Write minimal implementation**

Keep editing capability but re-layout the page into:

- health summary hero
- dossier sections
- tabs or grouped work areas with cleaner spacing

**Step 4: Run test to verify it passes**

Re-run the targeted tests and confirm green.

**Step 5: Commit**

```bash
git add apps/web/app/saglik/page.tsx
git commit -m "feat: redesign health workspace"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 6: Redesign the maps, province packs, and emergency pages

**Files:**
- Modify: `apps/web/app/maps/page.tsx`
- Modify: `apps/web/app/province-packs/page.tsx`
- Modify: `apps/web/app/acil/page.tsx`
- Modify: `apps/web/app/__tests__/province-packs.test.tsx`

**Step 1: Write the failing test**

Extend tests to assert:

- offline map workspace copy
- installation-ready province inventory copy
- Turkish emergency panel copy

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/province-packs.test.tsx
```

Expected:

- FAIL after adding the new expectations.

**Step 3: Write minimal implementation**

Update the three pages to align with the shared hero + summary + workspace structure.

**Step 4: Run test to verify it passes**

Re-run the targeted tests and confirm green.

**Step 5: Commit**

```bash
git add apps/web/app/maps/page.tsx apps/web/app/province-packs/page.tsx apps/web/app/acil/page.tsx apps/web/app/__tests__/province-packs.test.tsx
git commit -m "feat: redesign maps, province packs, and emergency pages"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 7: Clean up shell-language and consistency gaps exposed by the redesign

**Files:**
- Modify: `apps/web/components/TopBar.tsx`
- Modify: `apps/web/components/Sidebar.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`

**Step 1: Write the failing test**

Add or extend assertions for corrected Turkish labels and command-center terminology.

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/TopBar.test.tsx components/__tests__/Sidebar.test.tsx
```

Expected:

- FAIL because some shell labels still use old or inconsistent copy.

**Step 3: Write minimal implementation**

Clean up remaining shell language and align labels with the redesigned pages.

**Step 4: Run test to verify it passes**

Re-run the targeted tests and confirm green.

**Step 5: Commit**

```bash
git add apps/web/components/TopBar.tsx apps/web/components/Sidebar.tsx
git commit -m "chore: align shell language with interior redesign"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 8: Run full verification

**Files:**
- No code changes required

**Step 1: Run targeted tests**

Run:

```bash
cd apps/web
npm test -- --runInBand
```

Expected:

- PASS for all existing and newly added web tests.

**Step 2: Run production build**

Run:

```bash
cd apps/web
npm run build
```

Expected:

- PASS with no new build errors.

**Step 3: Manually verify the main routes**

Check:

- `/documents`
- `/search`
- `/sinav`
- `/saglik`
- `/maps`
- `/province-packs`
- `/acil`

Expected:

- coherent interior page hierarchy
- Turkish-first copy
- no obvious layout breakage on desktop or mobile widths

**Step 4: Commit**

```bash
git add .
git commit -m "feat: unify interior command-center pages"
```

Current workspace note: skip this step here because `.git` is unavailable.
