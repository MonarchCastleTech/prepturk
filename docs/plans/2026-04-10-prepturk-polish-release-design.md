# PrepTurk Polish + Branding + Release Design

## Goal

Take PrepTurk from "working local prototype" to "publishable product surface" by fixing UI consistency, polishing route content, creating a real brand mark, and packaging the repo for a GitHub launch with a README that matches the clarity and confidence of Project N.O.M.A.D. without copying it.

## Current State

- The shell direction is better than before, but the app still has uneven hierarchy and inconsistent route polish.
- The repo has a strong README foundation, but it is long, dense, and not yet arranged like a release-quality landing document.
- There is already a placeholder logo at [`apps/web/public/logo.svg`](/C:/Users/akgul/Downloads/prepturk/prepturk/apps/web/public/logo.svg), but it reads as temporary.
- The workspace is not currently a git repository, so "send to GitHub" requires repository initialization or attachment to an existing remote.
- Browser checks on `/documents` and `/search` show backend dependency failures on `localhost:8000`, so final visual review needs either a running backend or controlled mock fallbacks.

## Approaches

### Option 1: README-first release prep

Ship a new README, a nicer logo, and GitHub packaging first, then keep polishing the product later.

Pros:
- Fastest path to a public repo
- Minimal engineering churn

Cons:
- Public repo would still showcase visible UI inconsistencies
- Screenshots and README claims would get ahead of the product

### Option 2: Full product polish before publish

Audit every major top-level route, normalize shell/page hierarchy, fix copy and empty states, then do branding and GitHub packaging.

Pros:
- Best public first impression
- Screenshots, README, and product state stay aligned

Cons:
- Longer path
- Needs a defined pass order to avoid endless tweaking

### Option 3: Phased release polish

Do a strict release-quality pass on the shared shell and the public/high-traffic routes first, then complete brand assets, README, and GitHub publication. Lower-priority routes get consistency fixes only where they visibly break the system.

Pros:
- Best balance of speed and quality
- Keeps scope realistic
- Matches how the product will actually be evaluated by a first-time visitor

Cons:
- Requires disciplined cut lines
- Some deeper interior pages may remain less polished than the hero routes

## Recommendation

Use Option 3.

That means:

1. Lock the shell and the high-traffic routes first.
2. Normalize content and visual language across the app.
3. Create the real logo and replace temporary assets.
4. Rewrite the README as a product-grade repository front page.
5. Initialize/publish the repo to GitHub only after the visual and documentation surfaces agree.

## Product Design Direction

### 1. One hierarchy, one voice

The shell should carry global system context. Pages should carry task context. No route should feel like a second homepage, and no route should restate the shell's purpose in a heavier block than the shell itself.

### 2. Route polish by visibility

The release pass should prioritize:

- `/dashboard`
- `/documents`
- `/search`
- `/maps`
- `/province-packs`
- `/ai-chat`
- `/vault`
- `/notes`

Other routes should be checked for broken spacing, inconsistent copy, missing empty states, and obvious styling drift, but only rewritten if they damage the release impression.

### 3. Content normalization

PrepTurk currently mixes:

- Turkish UI labels
- English structural labels
- placeholder technical copy
- temporary release language

The polish pass should define a single rule set:

- Product-facing UI stays Turkish-first
- developer-facing docs stay English-first
- technical shell microcopy stays short and operational
- avoid duplicated "command center" phrasing across nested layers

### 4. Brand system

The current logo is usable as a placeholder but not release-grade. The branding pass should produce:

- a compact mark
- a horizontal lockup
- favicon/app icon variants
- social/README hero image support if needed

Because the logo is to be created in Gemini, the plan should treat Gemini as concept generation, not blindly final production. If Gemini outputs only raster artwork, the repo asset should be redrawn or simplified into SVG for actual product use.

### 5. README strategy

The target is not "copy Project N.O.M.A.D." The target is:

- strong hero
- clear positioning
- decisive architecture explanation
- fast-start install path
- screenshots that match current UI
- explicit differentiation
- clean navigation through the document

The current README already has strong substance. The work is editorial: tighten the sequence, reduce overload near the top, improve scanability, and make the repo feel ready to adopt.

### 6. GitHub release packaging

Publishing should include:

- a clean git repo state
- a reviewed `.gitignore`
- no local screenshot clutter in tracked files
- a polished README
- visible brand assets
- sane initial commit structure
- remote configuration and push

## Risks

### Backend-dependent route review

If the backend remains unavailable, polish can still proceed on shell/layout/copy, but final screenshots and result-heavy route QA will be partial.

### Gemini output mismatch

Gemini may return a logo style that looks good as an image but poor as an actual app mark. The plan must include a conversion/simplification step.

### GitHub destination ambiguity

The workspace has no `.git` directory right now. The release plan must assume either:

- initialize a new repo locally, or
- attach this folder to an already-created remote

## Success Criteria

- Shared shell feels intentional and non-redundant
- High-traffic routes feel like one product
- Copy is consistent and less placeholder-heavy
- Logo looks deliberate and ships in real app assets
- README is launch-grade and visually aligned with the product
- Repo is ready to publish to GitHub with minimal cleanup left
