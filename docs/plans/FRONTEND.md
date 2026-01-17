# Plante — Pixel UI Implementation Specification (Frontend-only)

Purpose: exhaustive implementation spec for a game-like, pixel-art user interface for **Plante**. Split into ordered phases so a coding agent can implement the UI. This document covers architecture, component catalog, assets, style system, tooling, testing, developer workflows, acceptance criteria, and a precise list of inputs the human must provide.

**Important:** this is UI-only. No backend integration code should be implemented yet. The agent must mock APIs and persist only locally (in-memory or in-browser mocks) until backend contracts are supplied. The agent must notify the user immediately when a human input listed in **“Required user inputs”** is needed.

---

# 1. High-level constraints & design rules

* Pixel-art consistency: everything that visually reads as pixel-art must be designed and rendered with integer pixel sizes, pixel snapping, and CSS `image-rendering: pixelated` for raster assets.
* Palette-first: use a constrained 16-color palette (PICO-8 or chosen palette) for UI elements, badges, and pixel sprites. Colors outside the palette require explicit approval.
* Font policy: use a bitmap/arcade font (Press Start 2P or equivalent) for headings and game UI; use a legible system font for non-game text (e.g., body copy).
* Responsive by breakpoints but preserve pixel integrity: scale whole UI at integer multiples (1x, 2x) where possible; for small screens use simplified layouts rather than squeezing pixel UI.
* Accessibility: all interactive elements must be keyboard-focusable and have accessible text (ARIA). Pixel look must not sacrifice readability/contrast.
* No real data: until backend APIs are provided, use a mock service layer (MSW or similar) and Storybook stories.

---

# 2. Project setup & foundation (Phase 0 — Preparation)

**Goal:** create the scaffold, dev tools, and asset pipeline so all later work is plug-and-play.

**Deliverables**

* Project scaffold (React + TypeScript + Vite recommended) with:

  * Tailwind CSS + custom config for pixel grid and design tokens
  * NES.css imported as base pixel UI primitives
  * Storybook configured for component development and visual review
  * Linter & formatter (ESLint, Prettier) with TypeScript rules
  * Test runner (Vitest recommended) + React Testing Library
  * Visual regression testing integration (optional for hackathon: Playwright snapshot or Percy)
* Asset pipeline:

  * `/assets/sprites/` and `/assets/sheets/` directories with README
  * Sprite sheet format spec and loader documentation (JSON metadata for frames)
  * Aseprite / Piskel / TexturePacker recommended toolchain documented
* Mock API:

  * MSW (Mock Service Worker) skeleton with endpoints mirroring the eventual backend contract (device, farms, achievements, users). All endpoints should return deterministic mock data (seeded).
* Storybook stories for at least one example component (Notification bell or Farm Card).
* Design tokens file (colors, font sizes, spacings, grid unit) in JSON/TS.

**Agent tasks**

* Create the file/folder conventions (see Section 6).
* Configure Tailwind theme extension for pixel scale tokens.
* Add a README with pixel art and file naming rules.
* Create two example sprite assets (placeholder) and a sample sprite sheet metadata file.

**Acceptance criteria**

* `yarn dev` / `npm run dev` launches the app shell.
* Storybook runs and shows the sample component.
* MSW serves mocked responses at `/api/*` routes.

---

# 3. Style system & design tokens (Phase 1 — Foundation: visuals & tokens)

**Goal:** define a single source of truth for pixel styling.

**Deliverables**

* Design tokens (JSON or TS) including:

  * Palette: 16 colors (provide hex list; default to PICO-8 palette unless user supplies brand palette).
  * Font tokens: `font-game`, `font-ui`, fallback stack.
  * Sizes: pixel grid base (e.g., base unit = 8px), pixel scale multipliers (1x, 2x).
  * Border radii (prefer 0 or 2px for pixel look).
  * Spacing scale in pixels (8, 12, 16, 24, 32).
  * Shadow tokens: if used, keep to single subtle pixel-shadows or avoid.
* Tailwind config that imports tokens and exposes classes for:

  * Palette swatches (e.g., `bg-palette-01`)
  * Pixel grid utilities (e.g., `pixel-grid-1`)
  * Typography utilities for pixel fonts at exact px sizes
* A style guide file:

  * Pixel grid rules (snap to whole pixel, avoid subpixel transforms on pixel-art elements)
  * Image handling rules (`image-rendering: pixelated`, `shape-rendering: crispEdges` for SVG)
  * Sprite usage rules (tile sizes, padding, 2x assets)
* Palette swatches and examples (screenshots or Storybook page).

**Agent tasks**

* Build the design tokens, plug into Tailwind, and create a Storybook “Design Tokens” story page.

**When agent must ask user**

* Confirm palette choice (use default or provide brand palette). See **Required user inputs**.

---

# 4. Asset & sprite specifications (Phase 1 continuation)

**Goal:** standardize all assets so UI code can rely on uniform sizes.

**Sprite rules**

* Tile sizes: primary tile = **32×32 px** for featured items; small tiles = **16×16 px** for HUD icons; avatar tiles = **48×48 px** (or 2× sprite sheet with 96×96 @2x).
* Avatar sprite sheet:

  * Layered approach: base head, hair, eyes, mouth, body, clothing, accessory.
  * Export each layer as transparent PNG and supply a combined atlas JSON for rendering.
* Frame rates:

  * Idle loops: 4–8 FPS
  * Action loops (short): 8–12 FPS
* Naming convention:

  * `sprite_<category>_<name>_<size>_<frame>.png`
  * Sprite sheets: `sheet_<category>_<size>.png` + `sheet_<category>_<size>.json`
* File formats:

  * Use PNG for pixel art (lossless). Provide 2× PNGs for retina (same as pixel art scaled 2×).
  * Avoid JPG/WebP for sprite sheets unless testing; prefer PNG for crisp pixels.

**Sprite metadata schema (description)**

* `name`, `category`, `tileSize`, `frames`, `anchor` (x,y), `animations` (map of name → frames/time).

**Agent tasks**

* Create sample sprite sheets and JSON metadata for: icons, achievement badges, avatar components, UI frames (GameBoy frame).
* Add scripts or documentation to load sprite sheets into UI (no backend).

**When agent must ask user**

* Provide official logo in SVG/PNG if available (SVG preferred).
* Provide any custom avatar parts they want included (optional).

---

# 5. Component catalog (Phase 2 — Core components)

**Goal:** implement a component library with Storybook stories. Each component must have: purpose, props/data schema, visual variants, accessibility requirements, acceptance criteria.

Below is the exhaustive component list and required details for each. The agent must create components using React + TypeScript; each component must have a Storybook story and unit tests.

---

## 5.1 Layout & navigation

* **AppShell**

  * Purpose: main layout wrapper (header, nav, content area, footer).
  * Props: `children`, `user`, `theme`.
  * Variants: pixel scale (1x / 2x).
  * Accessibility: semantic header, nav landmarks.
* **TopBar**

  * Purpose: logo, nav, notification bell, user avatar.
  * Props: `onToggleSidebar`, `notificationsCount`, `user`.
* **Sidebar / MapGrid**

  * Purpose: farm list + quick actions.
  * Props: `farms[]`, `onSelectFarm`.
  * Variant: collapsible.

---

## 5.2 Core widgets & HUD

* **FarmCard**

  * Purpose: tile representing a farm unit on dashboard.
  * Props: `id`, `name`, `status` (`healthy|warning|critical`), `thumbnail`, `sensorsSummary`, `actions`.
  * Visual: tile with pixel border, status hearts/bar.
* **SensorBadge**

  * Purpose: small HUD showing temperature / humidity / soil.
  * Props: `type`, `value`, `unit`, `trend`.
  * Variant: small (16×16 icon) and med (32×32).
* **ActionButton**

  * Purpose: NES-styled primary/secondary buttons (Water Now, Open Hatch).
  * Props: `label`, `variant`, `onClick`, `loading`.
  * Accessibility: keyboard + ARIA.

---

## 5.3 Notifications & Activity

* **NotificationBell**

  * Purpose: bell icon with unread count dropdown.
  * Props: `items[]` (type, severity, ts, read), `onMarkRead`.
  * Dropdown: list with severity color, link to event.
* **ActivityFeed**

  * Purpose: chronological events; used for user profiles and farm detail.
  * Props: `events[]` with `icon`, `text`, `ts`, `meta`.
  * Variant: condensed / expanded.

---

## 5.4 Achievements & Progression

* **AchievementBadge**

  * Purpose: show a small badge (locked/unlocked).
  * Props: `id`, `title`, `description`, `rarity`, `unlockedAt`.
  * Visual: 16x16/32x32 sprite + tooltip.
* **LevelUpModal**

  * Purpose: celebratory overlay when level reached.
  * Props: `level`, `rewards[]`, `onClose`.
  * Animation: scale/flash using Framer Motion (pixel-style timing).

---

## 5.5 Avatars & character system

* **AvatarRenderer**

  * Purpose: deterministic pixel avatar renderer (seeded by user id).
  * Props: `seed`, `size`, `emotion` (idle, happy, sad, excited).
  * Implementation notes: compose layered PNGs client-side from asset layers; animate via CSS sprite steps.
* **AvatarPicker (Storybook)**

  * Purpose: preview generator with seed input and color swap controls.
  * Props: `onSeedChange`, `variants`.

---

## 5.6 Player Museum & Exhibits

* **MuseumGrid**

  * Purpose: grid of “exhibit tiles” representing plants.
  * Props: `exhibits[]` with `owner`, `plantThumbnail`, `title`, `ts`.
  * Feature: hover shows quick stats; click opens modal.
* **ExhibitModal**

  * Purpose: view plant detail, growth timelapse, photos.
  * Props: `exhibitId`, `images[]`, `stats`.

---

## 5.7 Camera & Timelapse

* **CameraFrame**

  * Purpose: render camera image inside GameBoy/TV frame (pixel UI).
  * Props: `imageUrl`, `controls` (`play`, `frame`).
  * Controls: pixelated arrows, frame scrubber (stepper).
* **TimelapseViewer**

  * Purpose: playback images with frame-by-frame control.

---

## 5.8 Charts & Trends

* **PixelChart**

  * Purpose: time-series chart styled with stepped/pixel lines.
  * Props: `series[]` (label, points), `height`, `stepped: true`.
  * Implementation: use Recharts/Visx with custom line shape or Canvas to preserve step edges.
* **MiniSpark**

  * Purpose: small 48x16 sparkline rendered as pixels.
  * Props: `points[]`, `width`, `height`.

---

## 5.9 Social features

* **PostCard**

  * Purpose: short posts from users (share photos, achievements).
  * Props: `author`, `avatar`, `content`, `media[]`, `likes`, `comments`.
* **LikeButton**

  * Purpose: like/unlike with small pixel animation.
  * Props: `count`, `liked`, `onToggle`.

---

## 5.10 Utility components

* **PixelModal**

  * Purpose: globally-consistent modal with pixel border and backdrop.
* **Toast / Notification**

  * Purpose: small ephemeral toasts for actions.
* **ThemeSwitcher**

  * Purpose: switch palettes/skins (spring, night, neon).

---

# 6. File & folder structure (convention)

Top-level (frontend):

```
/src
  /assets
    /sprites
    /sheets
    /fonts
  /components
    /AppShell
    /TopBar
    /FarmCard
    ...
  /pages
    /dashboard
    /farm
    /profile
    /museum
  /stories
  /styles
    tokens.ts
    tailwind.config.ts
  /mocks
    msw-handlers.ts
  /utils
  /hooks
  /tests
  main.tsx
  app.css
```

Naming conventions:

* Components PascalCase, files `ComponentName.tsx`, stories `ComponentName.stories.tsx`.
* Assets lowercase snake_case.

---

# 7. Mock data shapes (for Storybook & MSW)

**Guidelines (not code)**

* `User`: id, username, displayName, avatarSeed, level, xp.
* `Farm`: id, name, ownerId, status, thumbnailUrl, sensors {temp, humidity, soil}, lastSeen.
* `Achievement`: id, title, description, icon, rarity.
* `Exhibit`: id, ownerId, title, images [url, ts], stats.
* `Notification`: id, type, severity, message, ts, read.

Agent must implement deterministic mock data seeded from a single JSON file and offer toggles in Storybook to simulate states (many notifications, critical alert, museum with many exhibits).

**Agent must notify user** when sample images or labeled images are needed for timelapse / museum demo.

---

# 8. UI flows & pages (Phase 3 — Pages & flows)

For each page implement components and story permutations.

**Pages to implement**

1. **Dashboard (main)**

   * Farm grid with FarmCard tiles.
   * TopBar with notification bell and quick actions.
   * Quick stats (global health, total farms, leaderboard top3).
   * Acceptance: interactive tile selection opens Farm Detail modal.

2. **Farm Detail**

   * Large CameraFrame with last image and timelapse button.
   * Sensor timeline (PixelChart).
   * Action bar (Water Now, Open Hatch).
   * Activity feed.
   * Acceptance: action buttons show toasts and change mock data states.

3. **Profile & Player Museum**

   * Profile header (avatar, level, XP bar).
   * Achievements grid.
   * Visit Museum button that opens MuseumGrid of exhibits.
   * Acceptance: Visit museum shows sample exhibits and exhibit modal opens.

4. **Friends & Leaderboard**

   * Friends list with avatars and follow/unfollow.
   * Leaderboard with podium and full list.
   * Acceptance: leaderboard sorted and responds to mock changes.

5. **Species config & Settings**

   * Species selector, thresholds UI (pixel sliders), theme switcher.
   * Acceptance: changing thresholds updates Farm mock alerts.

---

# 9. Animations & micro-interactions (Phase 4 — Polish)

**General rules**

* Keep animations simple and pixel-friendly: scale on whole elements (no sub-pixel blur), use `steps()` timing for frame-based sprite animations.
* Use Framer Motion for orchestrated sequences (level-up modal), but ensure output uses integer scaling and `transform: translateZ(0)` only when appropriate.

**Required interactions**

* Button press: 2-frame scale down then restore (pixelated).
* Notification dropdown: pixel slide with small easing.
* Avatar emotion change: swap sprite frames; not crossfade.
* Level-up: modal with score pop + chest opening sprite sequence.
* Achievement unlock: small toast with badge spin (step animation).

**Agent must**

* Provide a small animation library or utility helpers that enforce pixel steps (e.g., `pixelStepFrames(n)` conceptual helper).
* Add Storybook stories showing all animation variants in “reduced motion” and default modes.

---

# 10. Accessibility & localization

**Accessibility**

* All actionable elements must have keyboard focus states (pixel-only focus outline or ring), visible focus ring with the palette's high-contrast color.
* Use ARIA labels for non-text UI (icons, sprites).
* Provide high-contrast alternative theme and a simplified mode (no animation).
* Ensure color contrast meets WCAG AA for text elements.

**Localization**

* Prepare UI text tokenization: store copy in JSON/TS `i18n` files. Implement translation keys in Storybook.
* Agent must include “strings” file with all UI copy and placeholders; request user for final copy or translations if needed.

**Agent must ask user**

* Provide canonical copy for: title, subtitle, achievement descriptions, onboarding text, legal text.

---

# 11. Testing & QA (Phase 5 — Verification)

**Unit & component tests**

* Every component must have:

  * Render test (snapshot)
  * Interaction test (click/keyboard)
  * Accessibility test (axe or jest-axe)

**Visual regression**

* Storybook snapshots via Chromatic or Playwright snapshots.
* Baseline golden images for major screens (dashboard, farm detail, museum).

**Manual QA checklist**

* Pixel-perfect asset rendering at 1x and 2x.
* Animations are smooth and respect reduced-motion.
* Keyboard navigation across main screens.
* Mock states: critical alerts, many notifications, empty museum, full museum.
* Responsive behavior at common breakpoints.

**Agent must**

* Supply test commands in README and one example test for NotificationBell and FarmCard.

---

# 12. Developer & CI workflow

**Local development**

* `dev` for app; `storybook` for UI components; `test` for unit tests.

**CI**

* On PR: run lint, typecheck, unit tests, storybook build, visual regression checks.
* PR review items: no direct DOM manipulation, all assets added to `/assets` with metadata JSON, Storybook stories for new components.

**Deployment**

* Provide instructions to build static site (Vite/Next), include Storybook static build artifact for design review.

---

# 13. Handoff artifacts (what the coding agent must produce)

For each phase produce the following artifacts and attach to PRs:

* Component implementation (TSX + styles) — one component per PR ideally.
* Storybook story with knobs/controls for variants.
* Unit tests and basic accessibility checks.
* Mock data files used by MSW.
* README updates: component usage docs, prop descriptions, mock data sources.
* Pixel asset folder with metadata JSON for each sheet.
* A “UI demo” route that navigates through prepared demo states (demo mode toggles).

---

# 14. Acceptance criteria per phase (non-time based)

**Phase 0 (scaffold)**

* App starts, Storybook available, MSW returning mock data.

**Phase 1 (tokens & assets)**

* Palette and font applied to a token page; pixel rendering verified.

**Phase 2 (components)**

* All core components implemented with Storybook stories and tests.

**Phase 3 (pages & flows)**

* Dashboard, Farm detail, Profile/Museum, Leaderboard pages implemented and interactive with mock data.

**Phase 4 (animations & polish)**

* Level-up and achievement flows are working and have reduced-motion alternatives.

**Phase 5 (QA & handoff)**

* All tests pass; visual regression baselines recorded; README updated with "how to swap in real backend".

Agent must mark each acceptance item completed in the PR description and include screenshots (1x and 2x).

---

# 15. Performance & production considerations (UI-only)

* Sprite atlasing: combine small PNG icons into sheets to reduce HTTP requests.
* Use `image-rendering: pixelated` and avoid CSS blur/filters on pixel assets.
* Lazy-load timelapse images and museum images; prefetch thumbnails.
* Defer heavy animations during storybook snapshots or testing.

---

# 16. Where the human must provide inputs (Required user inputs)

The coding agent must pause and request these inputs in the precise formats listed:

1. **Brand palette** (optional)

   * Format: JSON or list of hex color values. If none, agent uses default PICO-8 palette.
2. **Primary logo**

   * Preferred: SVG; fallback PNG (transparent) at 1024px wide.
3. **Favicon / app icon**

   * PNG 512×512 and 192×192.
4. **Achievement list**

   * Format: JSON array with `id`, `title`, `description`, `rarity` (common/rare/epic).
5. **Avatar custom parts** (optional)

   * PNGs layered, name convention, or approval to use DiceBear default sprites.
6. **Sample plant timelapse images**

   * At least 8 images for one example exhibit; filenames with ISO timestamps.
7. **Copy strings**

   * App title, onboarding text, empty-state copy, legal/terms blurb.
8. **Privacy policy / image retention preference**

   * Short text or policy document.
9. **Optional: Brand pixel skins**

   * One or more alternate palettes for skins (spring, night).
10. **If using DiceBear or 3rd-party avatar service: confirm acceptance of external API calls** (yes/no).

**Format & file locations:**

* Place assets into a zip or direct repo `assets/brand/` with clear filenames. Provide JSON files where requested.

Agent must not proceed beyond initial demo states without these inputs when required.

---

# 17. Guidelines for the coding agent (how to implement & report progress)

* Use Storybook-first approach: implement component + story + mock data + tests in each PR.
* For each PR include:

  * Short description of component & variants.
  * Link to Storybook story.
  * Screenshots 1x and 2x in PR body.
  * List of any missing assets or decisions required.
* When a decision or asset is missing, create a clear issue labeled `blocked-by-user` with the exact file name and format required and reference it in the PR.
* Use feature flags or Theme switcher to enable experimental skins or behaviors.
* Keep all code well-typed; export component prop types/interfaces and include inline documentation.

---

# 18. Example prioritized implementation checklist (phases mapped to tasks)

*Phase 0 (scaffold)*

* Create repo scaffold, Tailwind + NES.css, Storybook, MSW demo endpoints.

*Phase 1 (tokens & assets)*

* Implement design tokens, default palette, font import, add sample sprites.

*Phase 2 (components)*

* Implement TopBar, NotificationBell, FarmCard, ActionButton, AchievementBadge, AvatarRenderer.

*Phase 3 (pages)*

* Implement Dashboard, Farm Detail, Profile/Museum, Leaderboard.

*Phase 4 (animations)*

* Add LevelUpModal, achievement unlock sequence, avatar emotions, and toasts.

*Phase 5 (QA & handoff)*

* Tests, visual-regression, documentation, create demo route.

Agent must create one PR per major component or page and mark PR as Ready for Review only when Storybook story, tests, and mock data are present.

---

# 19. Handoff notes for later backend integration

* Keep data access in a single `/src/services/api.ts` layer that currently reads MSW mocks and can later be pointed to real endpoints.
* Define TypeScript interfaces for all domain entities in a central `types/` folder.
* Provide a “swap to backend” checklist: endpoint names, auth header expected, and required fields. Agent must add TODO notes in code where a real API contract is needed.

---

# 20. Final checklist for the user before coding begins

Provide the following (zip or repo files):

* Logo (SVG)
* Palette (if custom) or confirm default palette use
* Achievement list JSON
* At least one sample timelapse set (8 images)
* Approval to use DiceBear or upload custom avatar parts (if custom)
* Final copy for onboarding + empty states
* Confirmation of required languages (if localization needed)

---

Implementers: follow this spec strictly. Whenever a required resource, copy, or design decision is missing, stop and create a `blocked-by-user` issue listing the exact file names, formats, and where they must be placed. The agent must not continue implementing beyond obvious mock data and placeholder assets when blocked.

If you want, I will now convert this spec into a Storybook-first task list with individual tickets suitable to feed a coding agent (one ticket per component + assets).
