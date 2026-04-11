# PrepTurk Frontend Shell Design

Date: 2026-04-09

## Goal

Unify PrepTurk around one coherent frontend shell so the dashboard, interior workspaces, menus, and mobile navigation feel like one product instead of disconnected screens.

The quality bar is Project NOMAD's structural clarity and design integrity, not a direct visual copy. PrepTurk should keep its own Turkish-first identity while matching that level of cohesion.

## Approved Direction

- Adopt a single shell across `/`, `/dashboard`, and interior routes.
- Remove the current split between the cream landing dashboard and the dark interior shell.
- Keep the sidebar as the primary navigation system.
- Reduce the top bar into a compact contextual header.
- Make page bodies content-first instead of repeating shell messaging.
- Fix menu, tour, and floating-action layering so mobile navigation behaves correctly.

## Current Problems

### Two Competing Products

The current frontend presents two conflicting visual systems:

- a standalone dashboard with a light poster-like treatment
- a dark command-shell treatment for interior pages

This makes transitions between routes feel abrupt and undermines trust.

### Navigation Duplication

The product currently has three competing navigation layers:

- sidebar route hierarchy
- top-bar status and shell copy
- page-level hero sections that act like a second command center

Users should not have to parse multiple "primary" interfaces on the same screen.

### Weak Mobile Integrity

On mobile, the onboarding tour, drawer, and floating SOS button compete for visual priority. The menu drawer does not fully own the screen state, which makes the interface feel broken instead of deliberate.

### Repetitive Shell Messaging

Interior pages repeat generic shell language such as readiness, local index status, and command-center copy. That information belongs in one shared shell layer, not in every page hero.

## Design Principles

### One Product, One Shell

PrepTurk should behave like one operational system with multiple workspaces. Route changes should feel like moving between tools in the same environment, not entering different websites.

### Sidebar Owns Structure

The sidebar is the single source of truth for navigation hierarchy:

- top-level workspaces
- grouped readiness and field modules
- active state
- collapsed and mobile drawer behavior

The page body should never try to replace the sidebar with a second main menu.

### Top Bar Owns Context

The top bar should only provide:

- current workspace title and short context
- global search
- compact local system status
- shell actions such as command palette, easy mode, and tour

It should not function as a second hero area.

### Pages Own Tasks

Each page should use its available space for page-specific work:

- overview metrics
- primary tools
- filtering
- results
- secondary guidance

Interior pages should stop repeating product-wide shell messaging.

### Serious, Local, Calm

PrepTurk should communicate:

- local-first reliability
- operational readiness
- Turkish institutional credibility
- restrained visual confidence

The product should feel sober and trustworthy rather than decorative.

## Visual System

### Core Look

The unified shell should keep the existing dark command-center foundation:

- deep graphite and slate backgrounds
- restrained olive and green accents
- soft glass and panel layering
- low-contrast gradients
- one spacing rhythm
- one radius scale

The cream dashboard treatment should no longer be used as the main command-center surface.

### Typography

Keep the current IBM Plex stack:

- `IBM Plex Sans` for interface text and headings
- `IBM Plex Mono` for system values, counts, keyboard hints, and metadata

Typography should emphasize clearer hierarchy:

- stronger page titles
- smaller but cleaner meta labels
- less dense shell copy
- better separation between system status and main content

### Component Weight

Reduce ornamental bulk in shared chrome:

- lighter brand block in the sidebar
- shorter top bar
- fewer repeated pills and badges
- smaller footer diagnostics block

The shell should frame the work, not dominate it.

## Layout Architecture

### Global Shell

All main routes should render inside the same `Chrome` shell except intentionally special routes such as `login`, `setup`, or a stripped-down public emergency flow if that remains necessary.

Route behavior:

- `/` should render the dashboard inside the shell
- `/dashboard` should render the same integrated command center
- interior routes should remain inside the same shell

### Sidebar

The sidebar remains the primary navigation rail with three improvements:

1. Brand area becomes more compact and less card-like.
2. Top-level groups become easier to scan.
3. Saha Modulleri sections feel intentionally nested instead of appended.

Expected behavior:

- desktop collapsed mode keeps icon-only clarity
- desktop expanded mode preserves hierarchy without excess copy
- mobile drawer owns the screen when open

### Top Bar

The top bar becomes a compact shell header with two zones:

- left: page title, one-line context, optional compact status
- right: global search, command palette, shell actions

The current large hero-style header block should be removed.

### Dashboard

The dashboard should become the real command center inside the shared shell.

Recommended structure:

- compact command-center header
- quick action grid for core workspaces
- local system status strip
- operational summary cards
- optional "continue where you left off" or "priority tasks" section

This keeps the dashboard close to Project NOMAD's clarity while still feeling like PrepTurk.

### Interior Pages

Interior pages should follow one shared pattern:

- page header with route-specific title and short description
- summary strip with 2-4 small metrics
- main workspace area
- optional support rail for filters, tips, or context

Generic shell status copy should not be repeated inside page heroes.

## Interaction Design

### Search

There should be one clear global search affordance in the shell. Page-level search tools may remain where the workflow needs them, but they should look subordinate to the shell rather than like a duplicate header system.

### Active States

The active route should be obvious from the sidebar alone. Page headers should reinforce location with title and short copy, not with a second set of navigation-like cards.

### Mobile Drawer

When the mobile drawer is open:

- the drawer should sit above the page content
- the drawer should sit above the shell content overlays
- the rest of the UI should visually recede
- floating controls should not distract from the drawer state

### Emergency Access

The SOS button remains persistent, but its z-index behavior should adapt:

- normal shell state: visible and accessible
- mobile drawer open: visually subordinate or temporarily hidden
- emergency modal open: modal fully owns the screen

## Components Affected

### `Chrome`

Responsibilities after redesign:

- include dashboard routes inside the shell
- own mobile drawer state
- own shell spacing
- coordinate overlay layering

### `Sidebar`

Responsibilities after redesign:

- remain the primary navigation map
- simplify brand and diagnostics sections
- improve mobile drawer ownership
- preserve grouped route hierarchy

### `TopBar`

Responsibilities after redesign:

- compact contextual header
- global search
- shell actions
- no duplicated hero messaging

### `DashboardPage`

Responsibilities after redesign:

- serve as the main command-center workspace inside the shell
- provide quick entry into core modules
- surface operational readiness at a glance

### Shared CSS Tokens

The shell tokens in `globals.css` should be adjusted to support:

- shorter top-bar height
- tighter header spacing
- consistent panel rhythm
- improved layering rules for overlays

## Data Flow

This redesign should not change core business logic or API behavior.

Frontend state remains the same:

- `useUiStore` controls sidebar and shell actions
- route state comes from Next navigation
- page-level stores continue to manage filters and local page state

The work is primarily presentation and interaction architecture, not data architecture.

## Error Handling and Edge Cases

### Tour Overlay

The onboarding tour must not block first-use navigation. If the tour starts automatically, it must respect shell state:

- do not open over an active mobile drawer
- do not trap the menu behind higher z-index layers
- do not obscure critical controls on small screens

### Empty States

Pages such as search and documents should keep their current empty-state behavior, but the empty states should live inside the new, simpler page hierarchy.

### Small Screens

The shell should prioritize:

- readable page titles
- a single obvious search entry point
- an operable drawer
- non-overlapping overlays

## Testing Strategy

### Component Tests

Update and extend Jest coverage for:

- `Chrome` route inclusion behavior for `/` and `/dashboard`
- `Sidebar` rendering and active-state behavior
- `TopBar` compact shell rendering

### Page Smoke Tests

Add or update page tests for:

- dashboard rendering inside the shell
- search page hierarchy
- documents page hierarchy

### Manual Browser Verification

Verify in the browser:

- `/`
- `/dashboard`
- `/documents`
- `/search`
- mobile drawer open and closed
- tour overlay interactions
- SOS button interactions

## Non-Goals

- No backend or data-model redesign
- No route restructuring beyond shell inclusion behavior
- No attempt to mimic Project NOMAD's branding directly
- No broad refactor of all interior pages in this phase beyond shell alignment and the dashboard-command-center relationship

## Success Criteria

The redesign is successful when:

- `/`, `/dashboard`, and interior pages feel like one product
- the sidebar is the unambiguous primary navigator
- the top bar is compact and contextual
- mobile drawer interactions are stable
- dashboard and interior screens no longer feel visually unrelated
- the frontend reaches Project NOMAD's level of structural cohesion without losing PrepTurk's identity
