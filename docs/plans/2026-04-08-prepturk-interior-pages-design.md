# PrepTurk Interior Pages Design

Date: 2026-04-08

## Goal

Bring the interior pages of `prepturk` into the same professional, offline-first command-center system already established on the home shell and dashboard.

The redesign must fix the current inconsistency across pages such as `sinav`, `saglik`, `maps`, `documents`, `search`, `province-packs`, and `acil`, where the interface currently feels fragmented, visually uneven, and in places linguistically rough.

## Approved Direction

- Use the medium-weight redesign approach.
- Keep the existing routes and core functionality.
- Restructure page hierarchy where needed instead of applying only cosmetic changes.
- Keep the app fully offline-first in copy and interaction design.
- Keep the Project N.O.M.A.D. reference as a quality bar for seriousness and operational clarity, not as a direct clone.

## Problems To Solve

### Visual Fragmentation

The current interior pages do not read as one product:

- shell chrome is more polished than many content pages
- some pages still use older card layouts and spacing
- information density swings too far between pages
- active work surfaces and side panels are inconsistent

### Language Quality

Several pages still contain:

- English helper copy mixed into Turkish surfaces
- ASCII-only Turkish that reads unfinished
- inconsistent labels between similar actions
- survival/admin phrasing that feels improvised rather than institutional

### Information Hierarchy

The major interior pages often start too flat:

- titles and actions are not clearly prioritized
- urgency, status, and core tasks compete equally
- forms are shown before context
- secondary tools steal attention from the main workflow

## Design Principles

### One Product, Many Workspaces

Each interior page should feel like a specialized workspace inside the same command center.

Every major page should share:

- a clear page hero
- a compact status or summary band
- a primary work surface
- a secondary information rail or support column
- cleaner empty/loading states

### Offline Credibility

The interface should repeatedly communicate:

- local-first operation
- no dependency on external connectivity
- trusted document access
- calm, serious operational readiness

This should appear through copy, labels, and information framing, not loud warning banners everywhere.

### Turkish-First Polish

The product should read like a finished Turkish application:

- proper Turkish characters
- consistent terminology
- concise institutional copy
- no bilingual fallback unless genuinely needed

## Shared Page Pattern

The interior redesign should standardize on a common page structure.

### Hero

The hero establishes:

- what this workspace is for
- what the operator can do here
- what the current readiness or workload state is

It should contain a title, short supporting description, and 1-3 actions or summary pills.

### Summary Band

Below the hero, each page should show 2-4 compact operational summary cards, such as:

- active exam and progress
- stored health readiness fields
- saved map points
- search result counts
- active province packs

### Main Workspace

The primary content area should be visually dominant and easier to scan.

Typical patterns:

- list/detail
- map with side controls
- checklist with progress
- record editor with clear sectioning

### Support Rail

The secondary column should hold:

- filters
- quick references
- emergency or trust context
- counts and metadata

This content should support the main workflow rather than competing with it.

## Route-Level Design

### `apps/web/app/sinav/page.tsx`

Turn the page into a study operations workspace:

- exam switcher promoted into the hero
- countdown and progress surfaced as primary metrics
- study session controls simplified
- topic list restyled as a cleaner readiness checklist
- motivational copy reduced and integrated instead of floating as a separate gimmick

### `apps/web/app/saglik/page.tsx`

Turn the page into a local medical readiness dossier:

- emergency summary at the top
- blood type, allergies, chronic conditions, and notes grouped more clearly
- medications and contacts treated as structured records
- print/export actions preserved but less visually noisy
- form fields still editable, but the page should feel like a maintained dossier rather than a raw admin form

### `apps/web/app/maps/page.tsx`

Turn the page into a field map workspace:

- offline state expressed more cleanly
- saved point count and layer state summarized above the fold
- map panel visually upgraded
- add-point flow integrated into the workspace
- point list and layer controls aligned into a coherent side rail

### `apps/web/app/documents/page.tsx`

Turn the page into a document operations library:

- stronger hero and count summary
- filters and active filter chips treated more professionally
- result area aligned to the shell design language
- better empty and loading states
- grid/list switch visually calmer and more premium

### `apps/web/app/search/page.tsx`

Turn the page into a serious search console:

- query summary and result counts promoted
- official-source toggle treated as a high-trust control
- filter rail visually aligned with the documents page
- result cards upgraded to match the document library system
- remove improvised local link helper if unnecessary

### `apps/web/app/province-packs/page.tsx`

Turn the page into a local pack inventory surface:

- emphasize that content ships with installation
- show active vs ready states more clearly
- improve pack card consistency
- make the rights/manifest section feel like system documentation, not filler content

### `apps/web/app/acil/page.tsx`

Turn the page into a fast emergency panel:

- emergency numbers remain primary
- procedures are calmer and more trustworthy
- copy becomes fully Turkish and operational
- the page should feel intentionally minimal, not unfinished

## Shared Component Adjustments

The redesign may require small support changes in shared UI:

- `apps/web/components/DocumentCard.tsx`
- `apps/web/components/SearchBar.tsx`
- `apps/web/components/TopBar.tsx`
- `apps/web/components/Sidebar.tsx`

These should only be changed where needed to maintain visual continuity and Turkish language quality.

## Testing Strategy

The redesign should be protected by lightweight UI tests:

- documents page renders command-center style hero content
- search page exposes the official-source toggle and summary copy
- province packs page continues to communicate installation-ready content
- existing shell tests remain green

Manual verification should confirm:

- desktop spacing
- mobile stacking
- consistent Turkish copy
- no internet-dependent prompts on redesigned pages

## Repository Note

The current workspace does not expose a `.git` directory, so this design is saved locally but cannot be committed from here.
