# PrepTurk Command Center Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn `prepturk` into a professional offline command center, remove the mandatory login flow, and make `/` the real no-auth entry point.

**Architecture:** The implementation should start by removing auth assumptions from the frontend shell, then add a shared device-operator model on the backend for survival-mode routes, and finally refresh the visual system and highest-traffic pages around a command-center layout. Shared UI primitives and shell chrome must be updated first so page-level restyling inherits a coherent design system.

**Tech Stack:** Next.js 15 app router, React 19, Tailwind CSS, Zustand, SWR, FastAPI, SQLAlchemy async, PostgreSQL, Jest (to be configured for web), pytest/httpx for API coverage.

---

Repository note:

- The current workspace is not a git repository, so the commit steps below are placeholders until the code is moved into the real repo root or worktree.

### Task 1: Add a real frontend test harness for the redesign

**Files:**
- Create: `apps/web/jest.config.ts`
- Create: `apps/web/jest.setup.ts`
- Create: `apps/web/components/__tests__/Sidebar.test.tsx`
- Create: `apps/web/components/__tests__/TopBar.test.tsx`
- Modify: `apps/web/package.json`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`

**Step 1: Write the failing tests**

Write a shell smoke test that proves the new chrome does not depend on auth state.

```tsx
import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

jest.mock('../../lib/stores', () => ({
  useUiStore: () => ({
    sidebarOpen: true,
    toggleSidebar: jest.fn(),
  }),
  useEasyModeStore: () => ({ isEasyMode: false }),
}));

describe('Sidebar', () => {
  it('renders command-center navigation without logout controls', () => {
    render(<Sidebar />);
    expect(screen.getByText(/kontrol merkezi/i)).toBeInTheDocument();
    expect(screen.queryByText(/cikis yap/i)).not.toBeInTheDocument();
  });
});
```

Write a top-bar smoke test that proves the shell renders device status rather than a user badge.

```tsx
import { render, screen } from '@testing-library/react';
import TopBar from '../TopBar';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../lib/stores', () => ({
  useUiStore: () => ({ setCommandPaletteOpen: jest.fn() }),
}));

jest.mock('../../lib/tour', () => ({
  useTourStore: () => ({ startTour: jest.fn() }),
}));

describe('TopBar', () => {
  it('renders search and system actions without user identity text', () => {
    render(<TopBar />);
    expect(screen.getByPlaceholderText(/ara/i)).toBeInTheDocument();
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd apps/web
npm test -- Sidebar.test.tsx TopBar.test.tsx
```

Expected:

- FAIL because Jest is not configured for the Next app yet.

**Step 3: Write the minimal implementation**

Add `next/jest` config and a lightweight setup file.

```ts
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(customJestConfig);
```

```ts
import '@testing-library/jest-dom';
```

Update `apps/web/package.json` so `npm test` uses the config explicitly if needed.

**Step 4: Run the tests to verify they pass**

Run:

```bash
cd apps/web
npm test -- Sidebar.test.tsx TopBar.test.tsx
```

Expected:

- PASS with two green shell smoke tests.

**Step 5: Commit**

```bash
git add apps/web/package.json apps/web/jest.config.ts apps/web/jest.setup.ts apps/web/components/__tests__/Sidebar.test.tsx apps/web/components/__tests__/TopBar.test.tsx
git commit -m "test: add web shell test harness"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 7: Restyle the highest-traffic pages around the new system

**Files:**
- Modify: `apps/web/app/documents/page.tsx`
- Modify: `apps/web/app/search/page.tsx`
- Modify: `apps/web/app/notes/page.tsx`
- Modify: `apps/web/app/vault/page.tsx`
- Modify: `apps/web/app/saglik/page.tsx`
- Modify: `apps/web/app/sinav/page.tsx`
- Modify: `apps/web/app/maps/page.tsx`
- Modify: `apps/web/app/province-packs/page.tsx`
- Test: `apps/web/components/__tests__/SetupPage.test.tsx`

**Step 1: Write the failing tests**

Add page smoke tests for professional empty states and hero copy on one library page and one utility page.

```tsx
expect(screen.getByText(/yerel bilgi kutuphanesi/i)).toBeInTheDocument();
expect(screen.getByText(/shared device notes/i)).toBeInTheDocument();
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd apps/web
npm test
```

Expected:

- FAIL because the old page structure and copy still exist.

**Step 3: Write the minimal implementation**

Apply the shared page template approach:

- hero row with title, description, and primary actions
- cleaner filters or tools band
- professional empty states
- consistent card spacing and metadata treatment

Examples:

`apps/web/app/documents/page.tsx`

```tsx
<section className="page-hero">
  <p className="eyebrow">Library</p>
  <h1>Yerel Bilgi Kutuphanesi</h1>
  <p>Mevzuat, rehberler, kaynak paketleri, and vetted references available without an internet connection.</p>
</section>
```

`apps/web/app/notes/page.tsx`

```tsx
<section className="page-hero">
  <p className="eyebrow">Notes</p>
  <h1>Shared Device Notes</h1>
  <p>Quick reference notes, emergency checklists, and locally stored reminders for this device.</p>
</section>
```

`apps/web/app/vault/page.tsx`

- promote encryption status into the hero
- clean up upload area density
- align tags and file actions with the new card system

`apps/web/app/saglik/page.tsx`

- upgrade the local-storage banner into a proper readiness panel
- keep allergy warnings prominent but cleaner

**Step 4: Run build, lint, and page tests**

Run:

```bash
cd apps/web
npm run build
npm run lint
npm test
```

Expected:

- build passes
- lint passes or identifies only pre-existing unrelated issues
- smoke tests pass

**Step 5: Commit**

```bash
git add apps/web/app/documents/page.tsx apps/web/app/search/page.tsx apps/web/app/notes/page.tsx apps/web/app/vault/page.tsx apps/web/app/saglik/page.tsx apps/web/app/sinav/page.tsx apps/web/app/maps/page.tsx apps/web/app/province-packs/page.tsx
git commit -m "feat: restyle core command center pages"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 8: Replace auth-heavy API smoke tests with no-auth command-center coverage

**Files:**
- Modify: `tests/e2e/test_auth.py`
- Modify: `tests/e2e/test_documents.py`
- Modify: `tests/e2e/test_search.py`
- Modify: `tests/smoke/test_health.py`

**Step 1: Write the failing tests**

Replace auth-route assertions with device-operator coverage.

```python
@pytest.mark.asyncio
async def test_documents_route_is_available_without_login():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        response = await client.get("/api/documents/")
    assert response.status_code == 200
```

```python
@pytest.mark.asyncio
async def test_search_route_is_available_without_login():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        response = await client.post("/api/search/", json={"query": "test"})
    assert response.status_code == 200
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
pytest tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py tests/smoke/test_health.py -q
```

Expected:

- FAIL because the API still expresses the old auth contract.

**Step 3: Write the minimal implementation**

Update the smoke suite so it verifies:

- no-auth command-center route access
- search/documents work without login
- health/readiness endpoints still work
- auth endpoints, if kept, are optional operational routes rather than mandatory product gates

Keep one minimal auth-route test only if the backend still intentionally exposes `/api/auth/*`.

**Step 4: Run the tests to verify they pass**

Run:

```bash
pytest tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py tests/smoke/test_health.py -q
```

Expected:

- PASS with the new no-auth assumptions

**Step 5: Commit**

```bash
git add tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py tests/smoke/test_health.py
git commit -m "test: align api coverage with no-auth command center"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 9: Final verification and manual visual pass

**Files:**
- Modify as needed: any touched files from previous tasks
- Test: `apps/web/app/page.tsx`
- Test: `tests/e2e/test_auth.py`
- Test: `tests/e2e/test_documents.py`
- Test: `tests/e2e/test_search.py`
- Test: `tests/smoke/test_health.py`

**Step 1: Run the full web verification**

Run:

```bash
cd apps/web
npm test
npm run build
npm run lint
```

Expected:

- test suite passes
- production build passes
- lint passes or only reports pre-existing issues that are documented

**Step 2: Run the API verification**

Run:

```bash
pytest tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py tests/smoke/test_health.py -q
```

Expected:

- PASS for the no-auth operator flow and API health checks

**Step 3: Run the manual browser pass**

Run the app locally and verify these routes on desktop and mobile:

- `/`
- `/documents`
- `/search`
- `/notes`
- `/vault`
- `/setup`
- `/saglik`

Check specifically:

- no route sends the user to `/login`
- shell spacing and typography feel consistent
- mobile drawer works
- alerts, cards, and hero sections stack correctly

**Step 4: Fix the smallest regressions found and rerun only the failing checks**

Run the narrowest relevant command for each issue, for example:

```bash
cd apps/web
npm test -- Sidebar.test.tsx
```

or

```bash
pytest tests/e2e/test_documents.py -q
```

Expected:

- PASS on each rerun

**Step 5: Commit**

```bash
git add apps/web apps/api tests
git commit -m "feat: deliver no-auth prepturk command center refresh"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 4: Add a shared device-operator auth model on the backend

**Files:**
- Modify: `apps/api/app/security/auth.py`
- Modify: `apps/api/app/db/models.py`
- Modify: `apps/api/app/routes/documents.py`
- Modify: `apps/api/app/routes/search.py`
- Modify: `apps/api/app/routes/notes.py`
- Modify: `apps/api/app/routes/vault.py`
- Modify: `apps/api/app/routes/ai_chat.py`
- Modify: `apps/api/app/routes/province_packs.py`
- Modify: `apps/api/app/routes/maps.py`
- Test: `tests/e2e/test_auth.py`
- Test: `tests/e2e/test_documents.py`
- Test: `tests/e2e/test_search.py`

**Step 1: Write the failing tests**

Replace auth-required expectations with no-auth operator expectations for public survival routes.

```python
@pytest.mark.asyncio
async def test_access_documents_without_auth(self):
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        response = await client.get("/api/documents/")
    assert response.status_code == 200
```

```python
@pytest.mark.asyncio
async def test_search_without_auth_uses_device_operator(self):
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        response = await client.post("/api/search/", json={"query": "test"})
    assert response.status_code == 200
```

Add a notes/vault ownership test that proves data can still be attached to one default operator.

```python
@pytest.mark.asyncio
async def test_create_note_without_auth_uses_device_operator():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        response = await client.post("/api/notes/", json={"title": "Shared note"})
    assert response.status_code == 201
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
pytest tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py -q
```

Expected:

- FAIL because routes still require `get_current_active_user`.

**Step 3: Write the minimal implementation**

Introduce a device-operator resolver in `apps/api/app/security/auth.py`.

```python
async def get_or_create_device_operator(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.username == "device_operator"))
    user = result.scalar_one_or_none()
    if user:
        return user

    user = User(
        email="device@local.prepturk",
        username="device_operator",
        password_hash=get_password_hash(uuid.uuid4().hex),
        display_name="Device Operator",
        language="tr",
        is_active=True,
    )
    db.add(user)
    await db.flush()
    await db.commit()
    await db.refresh(user)
    return user
```

Add a new dependency:

```python
async def get_local_operator(
    db: AsyncSession = Depends(get_db),
    cookie_token: Optional[str] = Cookie(None, alias="auth_token"),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> User:
    if credentials or cookie_token:
        return await get_current_user(...)
    return await get_or_create_device_operator(db)
```

Switch survival-mode routes from `get_current_active_user` to `get_local_operator`.

Important:

- keep destructive admin-only routes on `require_admin`
- preserve per-record ownership by assigning new notes, vault files, and AI conversations to the device operator

**Step 4: Run the tests to verify they pass**

Run:

```bash
pytest tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py -q
```

Expected:

- PASS for the rewritten no-auth survival flow
- auth-specific login/register tests may need to be reduced to route-existence or optional-admin coverage

**Step 5: Commit**

```bash
git add apps/api/app/security/auth.py apps/api/app/db/models.py apps/api/app/routes/documents.py apps/api/app/routes/search.py apps/api/app/routes/notes.py apps/api/app/routes/vault.py apps/api/app/routes/ai_chat.py apps/api/app/routes/province_packs.py apps/api/app/routes/maps.py tests/e2e/test_auth.py tests/e2e/test_documents.py tests/e2e/test_search.py
git commit -m "feat: add device-operator mode for survival routes"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 5: Refresh the design tokens, typography, and shell chrome

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/tailwind.config.ts`
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/components/ui/Button.tsx`
- Modify: `apps/web/components/ui/Card.tsx`
- Modify: `apps/web/components/ui/Badge.tsx`
- Modify: `apps/web/components/ui/Input.tsx`
- Modify: `apps/web/components/Chrome.tsx`
- Modify: `apps/web/components/Sidebar.tsx`
- Modify: `apps/web/components/TopBar.tsx`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`

**Step 1: Write the failing tests**

Add expectations for the renamed navigation label and status-oriented header copy.

```tsx
expect(screen.getByText(/kontrol merkezi/i)).toBeInTheDocument();
expect(screen.getByText(/offline/i)).toBeInTheDocument();
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd apps/web
npm test -- Sidebar.test.tsx TopBar.test.tsx
```

Expected:

- FAIL because old labels and old shell layout are still present.

**Step 3: Write the minimal implementation**

Introduce updated variables in `globals.css`.

```css
:root {
  --background: 220 20% 10%;
  --foreground: 48 20% 94%;
  --card: 220 18% 14%;
  --card-foreground: 48 20% 94%;
  --border: 218 14% 24%;
  --muted: 218 14% 18%;
  --muted-foreground: 214 12% 67%;
  --primary: 145 52% 46%;
  --warning: 35 89% 56%;
  --danger: 4 82% 60%;
}

body {
  font-family: var(--font-sans), sans-serif;
  background:
    radial-gradient(circle at top, rgba(72, 187, 120, 0.08), transparent 32%),
    linear-gradient(180deg, #12171f 0%, #0d1117 100%);
}
```

Update UI primitives so they share:

- larger radius
- softer borders
- stronger hover states
- mono utility text when appropriate

Rebuild the shell with:

- a slimmer sidebar
- grouped navigation
- a stronger page header
- no user/logout treatment

**Step 4: Run the tests to verify they pass**

Run:

```bash
cd apps/web
npm test -- Sidebar.test.tsx TopBar.test.tsx
```

Expected:

- PASS with the renamed shell content

Then run:

```bash
cd apps/web
npm run build
```

Expected:

- successful Next.js production build

**Step 5: Commit**

```bash
git add apps/web/app/globals.css apps/web/tailwind.config.ts apps/web/app/layout.tsx apps/web/components/ui/Button.tsx apps/web/components/ui/Card.tsx apps/web/components/ui/Badge.tsx apps/web/components/ui/Input.tsx apps/web/components/Chrome.tsx apps/web/components/Sidebar.tsx apps/web/components/TopBar.tsx
git commit -m "feat: refresh command center shell design system"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 6: Make `/` the actual command center and redesign the dashboard

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/components/SearchBar.tsx`
- Modify: `apps/web/components/StatusChip.tsx`
- Modify: `apps/web/components/TrustBadge.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`

**Step 1: Write the failing test**

Add a route-level expectation that the product lands in a command-center view rather than a loading redirect.

```tsx
import { render, screen } from '@testing-library/react';
import HomePage from '../../app/page';

describe('HomePage', () => {
  it('renders the command center entry state', () => {
    render(<HomePage />);
    expect(screen.getByText(/knowledge that never goes offline/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
cd apps/web
npm test -- page.tsx
```

Expected:

- FAIL because the root page still redirects or shows a loading spinner.

**Step 3: Write the minimal implementation**

Turn `/` into the command center and reuse the dashboard body there.

```tsx
import DashboardPage from './dashboard/page';

export default function HomePage() {
  return <DashboardPage />;
}
```

Redesign the dashboard structure:

- hero with title and operational summary
- urgent alert/status strip
- today modules
- quick actions
- recent knowledge

Hero copy should reflect the approved direction:

```tsx
<div>
  <p className="eyebrow">PrepTurk Command Center</p>
  <h1>Knowledge That Never Goes Offline</h1>
  <p>Offline knowledge, emergency planning, health references, and local tools in one survival workspace.</p>
</div>
```

**Step 4: Run the test and build to verify it passes**

Run:

```bash
cd apps/web
npm test -- page.tsx
npm run build
```

Expected:

- PASS for root-page rendering
- successful build

**Step 5: Commit**

```bash
git add apps/web/app/page.tsx apps/web/app/dashboard/page.tsx apps/web/components/SearchBar.tsx apps/web/components/StatusChip.tsx apps/web/components/TrustBadge.tsx
git commit -m "feat: make root route the command center"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 2: Remove frontend auth gating and delete the live login flow

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/login/page.tsx`
- Modify: `apps/web/app/setup/page.tsx`
- Modify: `apps/web/app/saglik/page.tsx`
- Modify: `apps/web/app/sinav/page.tsx`
- Modify: `apps/web/app/toplanma/page.tsx`
- Modify: `apps/web/app/topluluk/page.tsx`
- Modify: `apps/web/components/Chrome.tsx`
- Modify: `apps/web/components/Sidebar.tsx`
- Modify: `apps/web/components/TopBar.tsx`
- Modify: `apps/web/lib/auth.tsx`
- Modify: `apps/web/hooks/useAuth.ts`
- Test: `apps/web/components/__tests__/Sidebar.test.tsx`
- Test: `apps/web/components/__tests__/TopBar.test.tsx`

**Step 1: Write the failing tests**

Add expectations that `/login` now redirects away and the shell no longer expects `AuthProvider`.

```tsx
import { render, screen } from '@testing-library/react';
import LoginPage from '../../app/login/page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('LoginPage', () => {
  it('does not render a login form anymore', () => {
    render(<LoginPage />);
    expect(screen.queryByLabelText(/kullanici adi/i)).not.toBeInTheDocument();
  });
});
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
cd apps/web
npm test -- Sidebar.test.tsx TopBar.test.tsx page.tsx
```

Expected:

- FAIL because auth UI and auth dependencies are still present.

**Step 3: Write the minimal implementation**

Replace the auth provider with plain chrome composition in `apps/web/app/layout.tsx`.

```tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import Chrome from '../components/Chrome';
import '../app/globals.css';

const sans = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-sans' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="dark">
      <body className={`${sans.variable} ${mono.variable}`}>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
```

Replace `/login` with a redirect route or immediate command-center handoff.

```tsx
import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/');
}
```

Update `Sidebar` and `TopBar` to remove:

- `useAuth`
- user badge text
- logout button

Update guarded pages to stop pushing to `/login`.

Replace `apps/web/lib/auth.tsx` with a small compatibility stub until imports are removed:

```tsx
'use client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useAuth() {
  return {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: true,
    login: async () => {},
    register: async () => {},
    logout: () => {},
  };
}
```

**Step 4: Run the tests to verify they pass**

Run:

```bash
cd apps/web
npm test -- Sidebar.test.tsx TopBar.test.tsx
```

Expected:

- PASS with no references to logout or login UI in the shell.

**Step 5: Commit**

```bash
git add apps/web/app/layout.tsx apps/web/app/page.tsx apps/web/app/dashboard/page.tsx apps/web/app/login/page.tsx apps/web/app/setup/page.tsx apps/web/app/saglik/page.tsx apps/web/app/sinav/page.tsx apps/web/app/toplanma/page.tsx apps/web/app/topluluk/page.tsx apps/web/components/Chrome.tsx apps/web/components/Sidebar.tsx apps/web/components/TopBar.tsx apps/web/lib/auth.tsx apps/web/hooks/useAuth.ts
git commit -m "refactor: remove web auth gating"
```

Current workspace note: skip this step here because `.git` is unavailable.

### Task 3: Convert setup from account creation to device configuration

**Files:**
- Modify: `apps/web/app/setup/page.tsx`
- Modify: `apps/web/lib/stores.ts`
- Create: `apps/web/components/__tests__/SetupPage.test.tsx`
- Test: `apps/web/components/__tests__/SetupPage.test.tsx`

**Step 1: Write the failing test**

Write a test that proves the setup wizard no longer renders admin-account fields.

```tsx
import { render, screen } from '@testing-library/react';
import SetupPage from '../../app/setup/page';

describe('SetupPage', () => {
  it('shows device configuration instead of admin account creation', () => {
    render(<SetupPage />);
    expect(screen.queryByText(/admin hesabi/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sistem ayarlari/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
cd apps/web
npm test -- SetupPage.test.tsx
```

Expected:

- FAIL because step 2 still asks for admin credentials.

**Step 3: Write the minimal implementation**

Trim the setup store and UI so it tracks device readiness, not account provisioning.

```ts
interface SetupState {
  step: number;
  language: string;
  hostname: string;
  lanAccess: boolean;
  selectedModules: string[];
  storageLimit: string;
  aiModelProfile: string;
  contentPacks: string[];
  provincePack: string | null;
  completedAt: string | null;
}
```

Replace the old "Admin" step with a device profile step:

- device name
- installation mode
- readiness summary

Finish action should set a local completion flag and route to `/`.

```tsx
const handleFinish = () => {
  store.markCompleted(new Date().toISOString());
  router.push('/');
};
```

**Step 4: Run the test to verify it passes**

Run:

```bash
cd apps/web
npm test -- SetupPage.test.tsx
```

Expected:

- PASS with device-configuration copy and no admin-account form.

**Step 5: Commit**

```bash
git add apps/web/app/setup/page.tsx apps/web/lib/stores.ts apps/web/components/__tests__/SetupPage.test.tsx
git commit -m "refactor: turn setup into device configuration"
```

Current workspace note: skip this step here because `.git` is unavailable.
