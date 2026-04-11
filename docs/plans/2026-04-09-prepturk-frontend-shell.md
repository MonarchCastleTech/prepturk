# PrepTurk Frontend Shell Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify PrepTurk around one shared frontend shell so the dashboard, sidebar, top bar, and interior pages feel like one coherent command-center product.

**Architecture:** Keep existing routes and business logic, but move `/` and `/dashboard` into the shared shell, slim the shared chrome, and redesign the dashboard as an in-shell command center. Then fix shell layering and update targeted tests so the navigation and mobile behavior are locked in.

**Tech Stack:** Next.js 15 app router, React 19, TypeScript, Tailwind CSS, Zustand, Jest, Testing Library, Playwright for manual verification.

---

Repository note:

- The current workspace is not a git repository, so commit steps below are placeholders only.

### Task 1: Lock in shell route behavior with tests

**Files:**
- Modify: `apps/web/components/__tests__/Chrome.test.tsx`
- Test: `apps/web/components/__tests__/Chrome.test.tsx`

**Step 1: Write the failing test**

Update the shell test so `/` and `/dashboard` are expected to render shared chrome instead of skipping it.

```tsx
it('renders shell chrome on the dashboard routes', () => {
  pathname = '/dashboard';

  render(
    <Chrome>
      <div>Dashboard content</div>
    </Chrome>
  );

  expect(screen.getByText('Sidebar')).toBeInTheDocument();
  expect(screen.getByText('TopBar')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx
```

Expected:

- FAIL because `/dashboard` is still in `NO_CHROME_PATHS`.

**Step 3: Write minimal implementation**

Update `apps/web/components/Chrome.tsx` so `/` and `/dashboard` render inside the shell. Keep truly special routes only if they still need to bypass chrome.

**Step 4: Run test to verify it passes**

Run the same command and confirm green.

**Step 5: Commit**

```bash
git add apps/web/components/Chrome.tsx apps/web/components/__tests__/Chrome.test.tsx
git commit -m "feat: include dashboard routes in shared shell"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 2: Write dashboard shell smoke coverage

**Files:**
- Create: `apps/web/app/__tests__/dashboard-shell.test.tsx`
- Test: `apps/web/app/__tests__/dashboard-shell.test.tsx`

**Step 1: Write the failing test**

Add a dashboard smoke test that asserts the command center uses shell-compatible sections instead of the old standalone poster layout.

```tsx
expect(screen.getByText(/komuta merkezi/i)).toBeInTheDocument();
expect(screen.getByText(/hizli erisim/i)).toBeInTheDocument();
expect(screen.getByText(/yerel sistem durumu/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/dashboard-shell.test.tsx
```

Expected:

- FAIL because the current dashboard still renders the standalone cream tile layout.

**Step 3: Write minimal implementation**

Do not implement the page yet. Only keep the test in place so the redesign is forced by coverage.

**Step 4: Run test to verify it still fails for the expected reason**

Run the same command and confirm the failure is tied to missing dashboard hierarchy.

**Step 5: Commit**

```bash
git add apps/web/app/__tests__/dashboard-shell.test.tsx
git commit -m "test: cover dashboard shell hierarchy"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 3: Simplify the top bar into a compact contextual header

**Files:**
- Modify: `apps/web/components/TopBar.tsx`
- Modify: `apps/web/components/__tests__/TopBar.test.tsx`
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`

**Step 1: Write the failing test**

Update `TopBar.test.tsx` to expect:

- a shorter contextual header
- route-aware page title support or compact shell title copy
- the search input remaining present
- removal of the large repeated shell hero text

Example expectation:

```tsx
expect(screen.queryByText(/komuta ust kabugu/i)).not.toBeInTheDocument();
expect(screen.getByPlaceholderText(/ara/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/TopBar.test.tsx
```

Expected:

- FAIL because the current top bar still renders the large shell summary block.

**Step 3: Write minimal implementation**

Update `TopBar.tsx` and related shell spacing tokens in `globals.css`:

- reduce top-bar height
- remove the hero-like copy block
- keep one compact status row
- preserve search and shell actions

**Step 4: Run test to verify it passes**

Run the same test command and confirm green.

**Step 5: Commit**

```bash
git add apps/web/components/TopBar.tsx apps/web/components/__tests__/TopBar.test.tsx apps/web/app/globals.css
git commit -m "feat: simplify shell top bar"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 4: Refine the sidebar into the single primary navigator

**Files:**
- Modify: `apps/web/components/Sidebar.tsx`
- Modify: `apps/web/components/__tests__/Sidebar.test.tsx`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`

**Step 1: Write the failing test**

Update the sidebar smoke test to assert the redesigned shell behavior:

- `Komuta Merkezi` remains visible as a first-class route
- brand block is still present but lighter
- navigation groups remain intact
- no duplicated shell messaging leaks into nav items

Example expectation:

```tsx
expect(screen.getByRole('link', { name: /komuta merkezi/i })).toBeInTheDocument();
expect(screen.getByText(/bilgi ve hazirlik/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Sidebar.test.tsx
```

Expected:

- FAIL once the new sidebar copy and structure assertions are added.

**Step 3: Write minimal implementation**

Update `Sidebar.tsx`:

- slim the brand block
- reduce footer diagnostics weight
- keep grouped hierarchy
- preserve active-state behavior
- ensure the sidebar remains the single primary navigation source

**Step 4: Run test to verify it passes**

Run the same command and confirm green.

**Step 5: Commit**

```bash
git add apps/web/components/Sidebar.tsx apps/web/components/__tests__/Sidebar.test.tsx
git commit -m "feat: streamline sidebar navigation"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 5: Rebuild the dashboard as an in-shell command center

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/page.tsx`
- Test: `apps/web/app/__tests__/dashboard-shell.test.tsx`

**Step 1: Run the existing failing dashboard test**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/dashboard-shell.test.tsx
```

Expected:

- FAIL because the dashboard redesign is not implemented yet.

**Step 2: Write minimal implementation**

Replace the standalone cream landing view with an in-shell dashboard made of shared shell panels:

- compact page header
- quick access cards for core modules
- local system status strip
- operational summary area

Keep `app/page.tsx` forwarding to the dashboard route if that remains the simplest implementation.

**Step 3: Run test to verify it passes**

Run the dashboard test again and confirm green.

**Step 4: Run targeted shell smoke tests**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx app/__tests__/dashboard-shell.test.tsx
```

Expected:

- PASS for both tests.

**Step 5: Commit**

```bash
git add apps/web/app/dashboard/page.tsx apps/web/app/page.tsx apps/web/app/__tests__/dashboard-shell.test.tsx
git commit -m "feat: redesign dashboard inside shared shell"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 6: Fix mobile layering for drawer, tour, and SOS

**Files:**
- Modify: `apps/web/components/Chrome.tsx`
- Modify: `apps/web/components/SOSButton.tsx`
- Modify: `apps/web/lib/tour.tsx`
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/components/__tests__/Chrome.test.tsx`

**Step 1: Write the failing test**

Extend shell coverage to assert overlay coordination behavior where possible, for example:

- tour does not start on excluded states or while drawer state is open
- shell overlay structure still renders correctly

If a unit test is too awkward for full z-index validation, add a focused smoke assertion and document the rest for manual verification.

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx
```

Expected:

- FAIL after the stricter overlay assertions are added.

**Step 3: Write minimal implementation**

Update shell layering rules so:

- mobile drawer visually owns the screen
- tour does not cover or conflict with the drawer
- SOS does not float above the drawer in a distracting way

**Step 4: Run test to verify it passes**

Run the same command and confirm green.

**Step 5: Commit**

```bash
git add apps/web/components/Chrome.tsx apps/web/components/SOSButton.tsx apps/web/lib/tour.tsx apps/web/app/globals.css
git commit -m "fix: stabilize shell overlays on mobile"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 7: Update page hierarchy on the most visible interior screens

**Files:**
- Modify: `apps/web/app/search/page.tsx`
- Modify: `apps/web/app/documents/page.tsx`
- Modify: `apps/web/app/__tests__/search-page.test.tsx`
- Modify: `apps/web/app/__tests__/documents-page.test.tsx`
- Test: `apps/web/app/__tests__/search-page.test.tsx`
- Test: `apps/web/app/__tests__/documents-page.test.tsx`

**Step 1: Write the failing tests**

Update the search and documents smoke tests to assert that page headers are route-specific rather than repeating shell-wide messaging.

Example expectations:

```tsx
expect(screen.queryByText(/komuta ust kabugu/i)).not.toBeInTheDocument();
expect(screen.getByText(/arama komuta konsolu/i)).toBeInTheDocument();
expect(screen.getByText(/yerel belge komuta merkezi/i)).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd apps/web
npm test -- --runInBand app/__tests__/search-page.test.tsx app/__tests__/documents-page.test.tsx
```

Expected:

- FAIL because the current pages still rely on the oversized shell header to carry generic messaging.

**Step 3: Write minimal implementation**

Adjust page hierarchy so:

- the shell handles global system context
- the page header handles route-specific context
- repeated shell wording is removed

Do not rewrite business logic or data fetching.

**Step 4: Run test to verify it passes**

Run the same command and confirm green.

**Step 5: Commit**

```bash
git add apps/web/app/search/page.tsx apps/web/app/documents/page.tsx apps/web/app/__tests__/search-page.test.tsx apps/web/app/__tests__/documents-page.test.tsx
git commit -m "feat: align search and documents with unified shell"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 8: Run verification and capture browser evidence

**Files:**
- Modify: none
- Test: `apps/web/components/__tests__/Chrome.test.tsx`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`
- Test: `apps/web/app/__tests__/dashboard-shell.test.tsx`
- Test: `apps/web/app/__tests__/search-page.test.tsx`
- Test: `apps/web/app/__tests__/documents-page.test.tsx`

**Step 1: Run targeted frontend tests**

Run:

```bash
cd apps/web
npm test -- --runInBand components/__tests__/Chrome.test.tsx components/__tests__/Sidebar.test.tsx components/__tests__/TopBar.test.tsx app/__tests__/dashboard-shell.test.tsx app/__tests__/search-page.test.tsx app/__tests__/documents-page.test.tsx
```

Expected:

- PASS across the targeted shell and workspace coverage.

**Step 2: Run manual browser verification**

Run the app and verify:

```bash
cd apps/web
npm run dev
```

Then check:

- `http://localhost:3000/`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/search`
- `http://localhost:3000/documents`
- mobile viewport drawer behavior
- tour behavior
- SOS layering

Expected:

- dashboard and interior routes share one shell
- mobile menu is usable
- overlays do not visually fight each other

**Step 3: Commit**

```bash
git add .
git commit -m "feat: unify frontend shell and dashboard"
```

Current workspace note: skip this step here because `.git` is unavailable.
