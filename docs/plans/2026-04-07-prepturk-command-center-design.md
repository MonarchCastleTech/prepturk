# PrepTurk Command Center Design

Date: 2026-04-07

## Goal

Redesign `prepturk` into a professional offline command center that feels credible, calm, and operational, while removing the mandatory login flow and treating the device as a single shared local profile.

## Design Target

"Knowledge That Never Goes Offline."

This is the product bar for the redesign. The interface should feel like trusted offline infrastructure, not a hobby dashboard, generic admin theme, or survival-themed gimmick.

## Approved Decisions

- Borrow polish and structural quality from Project NOMAD, but do not copy its visual identity.
- Remove the login dynamic from the product flow.
- Keep one shared local profile for notes, health information, and study progress.
- Open `/` directly into the command center.
- Keep `/setup` as device setup and first-run configuration, not account creation.

## Product Structure

### Primary Experience

The authenticated shell becomes the actual product shell:

- `prepturk` opens directly into a command center.
- The shell is not a thin wrapper around disconnected utility screens.
- Navigation, hierarchy, and dashboard layout must communicate operational readiness.

### Route Behavior

- `/` becomes the command center.
- `/dashboard` should either redirect to `/` or render the same command-center content.
- `/login` leaves the live flow and should redirect to `/`.
- `/setup` remains available as a manual device-configuration route.

### Local Device Model

The app should behave like a single offline device with a shared operator profile:

- health data stays local and shared
- notes stay local and shared
- study progress stays local and shared
- the vault and AI history should also behave as device-local assets, not per-user assets

## Visual System

### Tone

The visual language should feel:

- calm
- serious
- high-trust
- operational

It should not feel playful, noisy, or over-styled.

### Brand Direction

PrepTurk should keep its own identity instead of mimicking Project NOMAD.

Recommended visual direction:

- graphite primary background
- slightly warmer stone/slate secondary surfaces
- restrained green for action and success
- amber for warnings
- red only for emergencies and destructive states
- blue reserved for utility/system information

### Typography

The current `Inter`-everywhere look reads as generic. The redesign should adopt a more deliberate interface stack:

- `IBM Plex Sans` for interface copy and titles
- `IBM Plex Mono` for timestamps, counters, hashes, coordinates, and system values

Typography priorities:

- stronger page titles
- cleaner section labels
- clearer information density
- better separation between metadata and primary content

### Surfaces

The current interface relies on flat dark blocks with repetitive borders. The redesign should introduce:

- layered panel depth
- softer border treatment
- larger radius
- more consistent spacing
- selective, low-contrast gradients
- stronger visual separation between shell chrome, panels, and content zones

The goal is polish, not decoration.

## Shell Layout

### Sidebar

The sidebar should become a cleaner command rail:

- clearer information architecture
- calmer active states
- stronger group titles
- less visual clutter
- better collapsed behavior

Expanded survival sections should remain, but they need to look intentional rather than appended.

### Top Bar

The top bar should become a true command header:

- search as a primary affordance
- page-level context
- system and mode controls
- cleaner profile/status space

The current top bar reads like a generic admin toolbar and should be redesigned accordingly.

### Mobile Behavior

The shell cannot simply squeeze into smaller widths.

On mobile:

- sidebar becomes an overlay drawer
- top actions remain reachable
- dashboard blocks stack by urgency
- hero and alerts stay readable above the fold

## Command Center Layout

The command center should open with stronger information hierarchy:

1. hero / command summary
2. urgent alerts and status band
3. today modules
4. recent knowledge and quick actions
5. secondary utilities

This replaces the current flat card stack that makes important and unimportant content compete equally.

### Hero

The hero should establish:

- what this system is
- what matters right now
- what the operator can do next

It should include a stronger title, contextual supporting copy, and high-priority actions.

### Status Band

The next strip should summarize the most important operational signals:

- weather or emergency alerts
- local data availability
- setup completeness
- offline readiness state

### Modular Sections

Core modules should follow in clearer groups:

- today
- emergency and health
- documents and search
- notes and planning
- quick actions

## Page Templates

### Command Center Pages

These pages should share a stronger hero + action + status layout:

- `apps/web/app/page.tsx`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/saglik/page.tsx`
- `apps/web/app/sinav/page.tsx`
- `apps/web/app/maps/page.tsx`
- `apps/web/app/acil/page.tsx`

### Library Pages

These pages should use a more professional list/detail and filter treatment:

- `apps/web/app/documents/page.tsx`
- `apps/web/app/search/page.tsx`
- `apps/web/app/province-packs/page.tsx`
- `apps/web/app/sablonlar/page.tsx`

### Utility Pages

These pages should keep the same design system while using tighter form and workspace patterns:

- `apps/web/app/notes/page.tsx`
- `apps/web/app/vault/page.tsx`
- `apps/web/app/setup/page.tsx`
- `apps/web/app/admin/page.tsx`

## Auth Removal

### Frontend

The current frontend auth layer should be removed from normal use:

- remove login gating from `/`, `/dashboard`, and other guarded pages
- stop rendering login as the default entry path
- remove user/logout UI from the shell
- remove token-based fetch guards from the frontend hooks

### Backend

Auth removal is not purely a frontend task.

The API currently requires `get_current_active_user` on almost every useful route, including:

- documents
- search
- notes
- vault
- AI chat
- province packs
- maps

To support a no-login survival flow, backend routes that power normal operator use need a shared local-operator mode. Admin-only or destructive configuration routes can remain protected or be moved behind a future local PIN if desired.

### Device-Level Ownership

Some data models are currently user-owned in the database:

- `Note.user_id`
- `VaultFile.user_id`
- `AIConversation.user_id`

The cleanest no-login behavior is to resolve these records through a default device operator instead of pretending ownership no longer exists.

## Setup Flow

The setup wizard should stop asking for admin account credentials.

Instead, it should focus on:

- language
- hostname / LAN mode
- module selection
- storage profile
- AI mode
- content packs
- province pack

Completion should feel like device readiness, not account provisioning.

## Risks

### Backend Coupling

If the backend continues requiring auth for survival-mode routes, the frontend redesign alone will still leave key pages functionally broken.

### Surface Consistency

Refreshing only the dashboard without updating shared UI primitives will produce a split visual system.

### Mobile Regression

Because the shell currently depends on fixed desktop offsets, mobile layout needs explicit treatment during implementation.

## Verification Expectations

Minimum verification after implementation:

- build the web app
- run lint if it is configured successfully
- confirm `/` opens into the command center
- confirm `/login` no longer gates the product
- verify high-traffic pages visually on desktop and mobile
- verify survival-mode routes still function without auth

## Repository Note

This workspace does not currently expose a `.git` directory, so the required "commit the design document" step from the brainstorming workflow is blocked in this environment.
