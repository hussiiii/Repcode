# Repcode 

Your personalized online notebook for everything Leetcode. 

This is the codebase, it's all hosted online for free though so if you just want to use it then visit repcode.io. If you would like to contribute, then continue reading. 


❤️❤️ SPECIAL THANKS TO ALL OUR CONTRIBUTORS: ❤️❤️
* OmkarSathish
* knownotunknown
* Pragyan14 
* ajinkya801
* mxskeen 
* Ad4mlars 
* ZidanCorson 
* M-Kandkur 
* Mohnish2004
* darshangoswami
* (add a PR to see your name here!) 




## Table of Contents
* [Introduction](#introduction)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Contributing](#contributing)
* [License](#license)

## Introduction

This project is an open-source platform designed to streamline your Leetcode practice. It includes features such as problem organization, AI-powered feedback, and spatial repetition for efficient learning.

## Features

* Organize problems & add your own notes, solutions, etc. 
* Review problems with a SuperMemo-based spatial repetition algorithm (same as Anki)
* Get AI-powered feedback on your solutions
* View detailed stats about your problems/DS and Algos, to target your weaknesses 

## Tech Stack

* **Frontend**: React, Next.js, TailwindCSS
* **Backend**: Prisma, MySQL (production), SQLite (development), Firebase (for auth)
* **Hosting**: Vercel

## Styling

The fixed current palette lives in `:root` in `src/styles/globals.css`, loaded by
`src/pages/_app.tsx`. Color variables store space-separated RGB channels so
Tailwind opacity modifiers work, for example `bg-action/20`.

Tailwind's default colors and numbered shades remain available. Prefer role
utilities such as `bg-background text-foreground`,
`bg-surface text-muted-foreground border-border`, and
`bg-action text-action-foreground`. Difficulty, study state, and status colors
have separate `difficulty-*`, `study-*`, and `status-*` names.

The temporary color aliases have been retired. Use `foreground` instead of
`primary`, `muted-foreground` instead of `secondary`, `background` instead of
`base_100`, and `border` instead of `divide`. Bare `blue`, `neutral`, `grey`, and
other legacy names have no custom meaning; Tailwind's numbered palettes remain
available. The whiteboard picker uses `bg-surface-inset`. Count badges use
`bg-surface-count`, and overdue notices use `status-overdue`. Unspecified borders
intentionally use `currentColor`; panels should specify `border-border`.

The homepage and `src/components/home` use shared role tokens throughout,
including hover/focus states, gradients, shadows, SVG fills, and the logo fade.
Use `marketing-action-*` for CTA gradient stops, `marketing-highlight-*` and
`marketing-glow-*` for decoration, and the separate marketing feedback,
navigation, rating, and chart roles for those elements. Named
`shadow-marketing-*` utilities keep glow geometry consistent. Marketing colors
are separate from application actions and domain statuses even when their
current RGB values match.

Code previews use `code-*` tokens; shared problem-description formatting uses
`code-inline-*` and `code-border`. Badges use `difficulty-*` and `study-*` tokens
for text, backgrounds, borders, and CSS hover states. Review badges retain their
existing softer palette independently of the legacy `review` color.
Define new color values in the central palette rather than adding literal
colors to homepage components. `tests/home-palette.test.js` checks the migrated
palette, generated utilities, interactive states, and this boundary.

The remaining application routes and components also use shared tokens. General
surfaces/text/borders reuse the core roles; `app-action-*`, `feedback-*`,
`editor-icon-*`, `chart-*`, `calendar-*`, and `drawing-*` preserve their distinct
current palettes. There is no theme toggle.

Use `cssColor(token, opacity?)` from `src/lib/colors.ts` for inline DOM/SVG styles.
Canvas and Chart.js require `canvasColor(token, opacity?)`, which reads the CSS
channels and returns a resolved color. Use `hexColor(token)` for libraries that
parse hex explicitly, such as Joyride's primary color. Canvas values are resolved
on the client; server rendering has safe placeholders. Charts resolve colors
when their data/options are built. Whiteboard tool colors use named ink tokens,
while saved paths keep their resolved hex colors so palette edits cannot change an
existing drawing.

`src/styles/vendor-colors.css` preserves the installed Ace One Dark,
highlight.js Atom One Dark Reasonable, and NProgress colors with
token-based overrides. Third-party layout/behavior and static logo/image artwork
remain with their original packages/assets. The app-wide palette tests check
source boundaries, variable references, generated utilities, and those library
color overrides; runtime helper and whiteboard tests cover the non-CSS consumers.
Tailwind's default shadows, placeholder shade, and ring colors also reference
shared variables while retaining their original values and geometry.

### Shared component conventions

Use repository-owned shadcn components with Radix primitives for interactive
behavior. `components.json` describes the existing Pages Router, TypeScript,
Tailwind 3 configuration, and `@/components/ui` aliases. Its `new-york` setting is
a generator baseline, not a request to replace Repcode's current styling.
Review generated source and adapt it to our RGB-channel tokens; do not overwrite
the palette, add a theme switch, or upgrade React/Tailwind as part of adding a
component. Add individual primitives only when a migration needs them.

Keep generic primitives in `src/components/ui` with lowercase filenames, named
exports, typed native props, and forwarded refs where appropriate. The generic `Badge.tsx` filename remains compatible. Use `DifficultyBadge` and `StudyStateBadge` from `components/app/ProblemBadges` for domain values. Put business rules and composed feature UI in `components/app` or
`components/home`; generic controls must not fetch data or know about auth,
problem scheduling, or collection ownership. Use `cn` for class composition.

Shared variants own colors, borders, corners, typography, padding, interaction
states, and shadows. Call sites may control layout such as width, placement,
margin, and flex alignment. Existing distinct appearances are compatibility
recipes for the current design; reuse them rather than introducing a variant per
page. Prefer existing sizes and variants for new features. A future redesign
changes these central recipes and tokens, not every caller's class string.

For actions, import `Button` from `@/components/ui/button`. Keep the original
`default`, `destructive`, `outline`, `secondary`, `ghost`, `link` variants and sizes
compatible. Current app recipes include `action`/`dialog`, `danger`, `quiet`,
`text`/`icon` with tones, and the existing marketing and toolbar appearances.
`size` owns spacing and geometry, `tone` selects a shared palette, `weight` allows
an explicit existing text weight, and `emphasis` selects a shared shadow.

```tsx
<Button variant="dialog" size="dialog" emphasis="dialog" loading={saving} onClick={save}>
  {saving ? 'Saving...' : 'Save'}
</Button>
<Button asChild variant="marketing" size="hero">
  <Link href="/login">Get Started Free</Link>
</Button>
```

Native Button actions default to `type="button"`; form submit actions must set
`type="submit"`. Use `asChild` for navigation so links retain their URL, target,
and browser behavior without nesting buttons. `loading` sets busy/disabled state
and preserves caller-provided progress content. Supply an accessible label for
icon-only actions, retain keyboard focus indicators, and do not remove labels or
native semantics for appearance. Future dialogs/menus/tabs must include keyboard
navigation, focus management, accessible names, and appropriate expanded/selected
state. Disabled/loading actions must not execute handlers or submit forms.

All visible action controls use `Button`; there are no deferred native-button
implementations or hidden DOM launchers. Collection creation is controlled by
React state. Shared controls include keyboard navigation, focus management,
accessible names, and expanded/selected state where appropriate.

Phase 2 uses the shared `Input`, `Textarea`, `NativeSelect`, `Label`, `Field`,
`InputGroup`, `Checkbox`, `RadioGroup`, `Slider`, and `Select` components for all
visible form controls. Native selects keep their browser menus; the chart picker
uses the Radix Select popup. The checkbox composes Radix with a native input using
`asChild`, retaining browser paint while its form bridge submits one named value.
Radio choices and the slider use Radix keyboard/selection behavior. These add the
five corresponding Radix primitives; no form-state framework is required.

Use `Field` with `FieldLabel` and optional `FieldDescription`/`FieldError` to wire
accessible names and descriptions. Generated IDs keep concurrently mounted forms
independent. Keep explicit `controlId`/input IDs only where existing DOM consumers
need them, such as the settings save handler. Preserve field **names**, controlled
versus uncontrolled values, refs, validation, and submitted data. Validation and
network requests stay in feature components; Field only connects presentation and
ARIA metadata. Hidden submission metadata remains a native hidden input.

Form variants preserve the existing dialog, problem, settings, marketing, search,
credential, chat, and report appearances. `InputGroup` owns grouped borders,
addons, and focus glows; field/textarea size props own geometry. Call sites supply
layout, field values, and events. The source audit rejects visible native controls
and scattered visual overrides outside the shared components. Jest tests cover
native form values/constraints, Radix keyboard behavior, chart switching, field
associations, settings/key handling, and feature submissions using mocked services.
The jsdom setup supplies only missing browser measurement/scroll APIs; browser
checks verify real geometry and pointer behavior separately.

Phases 3–4 use shared presentation and dialog components throughout the app,
public pages, and homepage previews. `Card` composes surface, border, radius,
padding, and elevation recipes; `CardHeader`, `CardTitle`, and the other card
parts support composed content. `Badge.tsx` owns generic badges, counts, and membership labels.
`DifficultyBadge` and `StudyStateBadge` compose it with problem colors and icons;
all domain callers use those feature components. Use `Separator`, Radix-backed `Avatar`/image/fallback, `Alert`,
`Spinner`/`LoadingState`, `Skeleton`, and the `Empty` parts for feedback and empty
states. Decorative feature illustrations, chart marks, editor panes, keep their feature-specific content.

Use `useToast()` from `components/ui/use-toast` for notifications. Pass React
content to `toast(message)`; use `useToast(5000)` to preserve a longer existing
notification duration. `_app` mounts the only `Toaster`. It owns up to three
independent Radix notifications, announcements, keyboard/swipe dismissal, and
pause/resume on hover, focus, or window blur. Notifications survive a feature or
modal unmount. Do not add feature-owned toast timers or viewports. The superseded `components/app/Toast` bridge has been removed.

Every active modal uses Radix-backed `Dialog`; destructive confirmations compose
`AlertDialog` through `ConfirmationDialog`. This includes create/edit and limit
branches, imports, random selection, statistics/manual lapse, onboarding, bug
reporting, video, collection/problem deletion, and moving a problem. Give each
content an accessible `DialogTitle`. Portals escape clipping ancestors; focus is
trapped, the background is inert, and body scroll is locked while the dialog is
open. Existing controlled launchers restore focus; if a successful deletion
removes the launcher, focus returns to `[data-dialog-focus-fallback]` or `main`.
Portal content inherits the same Inter font as the application.

Forms submit through their own native `onSubmit`, never window-wide Enter
handlers. Pending requests disable close actions and dismissal where required;
collection/problem forms also guard the token-await period against double
submission. Failed requests retain editable fields and show feedback. Normal
dialogs dismiss on Escape/outside interaction. Destructive confirmations focus
the safe close action and ignore backdrop clicks; their async action closes only
on success. `scroll` selects bounded body, contained form, selection-list, or
frame scrolling without changing existing visual recipes. Bug-report success
uses a cleaned-up close timer and the latest close callback.

Jest interaction tests use the real Radix behavior. Feature dialog integration
tests additionally use React Query with mocked HTTP responses to check payloads,
validation, pending states, errors/retries, success, cache refreshes, and focus.
No live account or database is required. Source guards account for all twelve
active modal surfaces and prevent scattered modal overlays, toast timers,
spinners, card surfaces, and badge style overrides from returning.

Phases 5–6 use the repository-owned `DropdownMenu`, `Popover`, `Tooltip`,
`Tabs`, `ToggleGroup`, and `Resizable` components. The problem and study-queue
More menus, problem-row actions, whiteboard ink picker, sidebar and calendar
help, all four dashboard metric/calendar help bubbles, warning explanations, skip hint, and timer hints use the shared Radix
primitives. A menu action that opens a dialog returns focus to its persistent
menu trigger when the dialog closes. Use a link item for external navigation,
and give icon-only help triggers a name. `react-tooltip` and its CSS overrides
were removed. Chart.js canvas tooltips and the guided study tour retain their
own feature-specific behavior.

`ProblemWorkspace` owns the problem and queue view tabs, shared More actions,
and the horizontal editor split. The left panel can be resized from 30% to
70% by pointer or keyboard; Ace receives resize notifications. Description,
Notes, Whiteboard, Solution, and Repcode AI mount only when visited, then remain
mounted and hidden while another view is selected. This preserves chat requests
and drafts, sketch tools and history, and each view's scroll position. Hidden
whiteboards do not handle editor undo shortcuts. Changing problems resets the
previous problem's chat, sketch, and editor data. The homepage editor preview
uses the same Tabs semantics but retains its static preview layout. The study
dashboard range switch uses Tabs; chart grouping and whiteboard tools use
single-choice Toggle Groups.

Jest checks menu focus and keyboard behavior, popover and tooltip dismissal,
tab selection, state preservation across view switches, sketch history, and
in-flight chat completion. Review actual panel geometry and pointer behavior
in a browser; jsdom does not provide real layout measurements.

Phases 7–8 complete the navigation and content system. All seven application
routes use `AppShell`; all five public content routes use `PublicShell`. Login uses `AuthShell` for its centered authentication layout, including its existing mobile notice. The shells own the page's main
landmark, and the public shell owns its navigation and footer. Sidebar, guide contents, problem-form Manual Entry, and
mobile navigation use Radix `Collapsible`; mobile Escape returns focus to the
toggle, links close the mobile panel, and active sidebar links expose
`aria-current`. Desktop and mobile navigation share their destinations; guide contents share their section hierarchy. Legal pages use the shell’s fixed-header inset.

All seven explicitly rendered tables use the shared `Table` parts and horizontally scrollable
`TableContainer`. Problem names are real keyboard-accessible links. All five
embedded videos use `MediaFrame` with Radix `AspectRatio`; the guide's previously
fixed-width embeds now fit narrow screens. `Heading` owns the common text scales,
weights, and tones; `Prose` handles problem, preview, and legal content.
Problem, queue, and preview descriptions use `Prose`, whose imported-content
styles live in `components/ui/typography.module.css`. Problem and queue
descriptions share `formatProblemContent`. That formatter normalizes imported code markup;
it does not sanitize HTML.

`ScrollArea` uses native browser scrolling with an explicit direction. Use it for
bounded lists, dialog bodies, chat, and workspace views. `TabsList` owns horizontal
overflow. The document scrolls on normal pages; locked problem shells bound the
workspace to the viewport, with independent content/editor scrolling. Dialog
scroll locking remains owned by Radix. Keep code-block horizontal overflow and
vendor editor/canvas scrolling with those specialized renderers.

The completion audit removed unused Carousel, SketchModal, ReportBugButton,
BackgroundDots, MoreInfo, and the Toast bridge, plus the unused Konva packages.
Generic primitives live in `components/ui`; business compositions such as
`ProblemWorkspace`, feature dialogs, charts, editor, tour, and whiteboard remain
in feature folders. See [the complete component inventory](docs/design-system.md)
for the finished system and how to extend it.

Verify app routes, public pages, and interactive previews when changing shared
recipes. Use Jest/React Testing Library for interactions and isolated fixtures
for authenticated visual checks. Keep API, authentication, and persistence
changes outside a presentation migration.

### Stylesheet ownership and retired conventions

`pages/_app.tsx` is the only global CSS entry for this Pages Router application.
It loads `styles/globals.css`, the original NProgress/highlight.js styles, then
`styles/vendor-colors.css` overrides. Feature components and pages do not import
global stylesheets. The global entry contains only Tailwind, the current palette,
placeholder defaults, and document overflow behavior.

Use colocated CSS Modules for selectors or keyframes that utilities cannot
express clearly. Navbar motion belongs to `home/NavBar.module.css`; dialog and
toast motion live beside those primitives; imported HTML styling belongs to
`ui/typography.module.css`; public anchor offsets belong to the public shell.
These animations include reduced-motion alternatives. Alert recipes own overdue
notice styling. Native text-wrapping utilities replace the former `.wrap-text`.
Existing component-scoped chat/queue styles retain their owners.

Unused calendar rules, animated-button rules, modal/slide classes, decorative
shadow/corner utilities, and the inactive `useDarkMode.js` were removed. The
retired palette aliases and their unused variables are recorded only as
regression-test metadata. `tests/styling-ownership.test.js` prevents duplicate
global imports and retired conventions from returning. Adding a CSS Module or
new semantic token does not require a theme toggle.

## Authentication and regression checks

Private API routes require a Firebase ID token in the `Authorization: Bearer ...`
header. Browser code should use `authenticatedFetch` from
`src/lib/authenticatedFetch.ts`. The server derives the account from the verified
token and checks collection/problem ownership; client-supplied emails and user IDs
do not grant access. Because existing database accounts are linked by email, API
access requires a verified email. Google sign-in supplies that verification.

Saved OpenAI keys stay on the server. Settings responses expose `hasApiKey`, and
the AI endpoint loads the signed-in user's saved key. A blank replacement field
preserves that key; the Settings page provides a separate removal action.

Use **Jest with `next/jest` for all automated tests**, including future tests.
Run `npm test` for authentication, ownership, sign-in, and credential-handling
regressions, `npm run test:watch` during development, and `npm run test:coverage`
for coverage reports. Test files belong under `tests/` and use `.test.js`,
`.test.jsx`, `.test.ts`, or `.test.tsx` names. React component tests use React
Testing Library and the jsdom environment; API/helper tests default to Node.

The suite uses Jest mocks for Firebase, Prisma, and OpenAI. It does not connect to
a live database or call paid AI services. `tests/setup-env.js` replaces external
service credentials loaded by Next with test-only values before app code runs.
Use Next's test transforms and Jest mocks rather than custom module loaders or
additional test runners. Run `npm run lint` and `npm run build` before submitting
changes as well.

## Getting Started

Below are detailed instructions for how to set up your local development environment and make and submit changes/PRs. If you run into any issues, please email repcode.io@gmail.com.

### Prerequisites

Ensure you have the following installed:
* Node.js (v22 or higher REQUIRED)
* npm or yarn
* SQLite (for local development)

### Installation

1. Fork the repo, then clone your fork to some folder on your desktop 

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```plaintext
DATABASE_URL="file:./dev.db"

```

4. Update `schema.prisma`:
   * Replace the contents of `schema.prisma` with the contents of `devTemplates/devprisma.txt`

5. Delete the folder `prisma/migrations` entirely 

6. Update `firebaseAdmin.js` 
* Replace the contents of `firebaseAdmin.js` with the contents of `devTemplates/firebaseAdmin.txt`

7. Update `src/firebaseConfig.js` 
* Replace the contents of `src/firebaseConfig.js` with the contents of `devTemplates/firebaseConfig.txt`

8. Initialize the SQLite database by running the following commands in the terminal of your code editor: 
```bash
npx prisma migrate dev --name init
npx prisma generate
```

9. Comment out the following line in `ProblemsQueue.tsx`, on line 412:
```typescript
// Comment out the below line to avoid runtime errors in development
// await updateContribution(user?.email || '');
```

10. Start the development server and navigate to the localhost on your browser:
```bash
npm run dev
```

Congratulations! You've now successfully set up the development environment! Feel free to explore and make some test changes to stuff to see how everything works.  

To view the database structure:
* Use any online SQLite database viewer and drag-and-drop the `prisma/dev.db` file.

Remember that you're using a local dev.db that emulates the structure of the production database, but not the content: it'll start off as empty. And changes you make to this DB won't affect the production DB (and vice versa). But any changes with data fetching/pushing that work on this dev db will work on the production db as well. 

For styling, use the shared semantic color tokens and UI components described above. Tailwind defaults remain available, but application colors belong in the central palette; do not hardcode hex values in components.

## Contributing

We welcome contributions! Check out the Issues tab and comment on any issues you want to work on! Follow these steps to contribute:

### Workflow for Contributors

1. Follow the 'Getting Started' instructions above 

2. **Create a new branch for your changes**:
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes locally**:
   * Follow the setup instructions under Getting Started to set up the dev environment 

4. **IMPORTANT: check to see if your changes actually build**: 
```bash 
npm run build 
``` 
* if there are any build errors, they'll be listed in the terminal, please fix them. If everything builds fine, you're good to go (warnings are fine, but errors must be addressed)

5. **Commit your changes**:
* Make sure to add/commit ONLY the files that actually relate to the PR: do NOT do `git add .`, as there are several files that are different from prod so that localhost works properly (like firebaseAdmin, firebaseConfig, everything in the Prisma folder, etc.) so you don't want to commit these to prod 
```bash
git add [files_you_modified]
git commit -m "Description of your changes"
```

6. **Push your branch to your fork**:
```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request (PR)**:
   * Go to the original repository's GitHub page.
   * Click the "Pull Request" tab.
   * Select your branch and submit the PR.
   * PLEASE include a screenshot if your change was styling-related! 
   * PLEASE include any relevent comments on your PR! 

8. **Wait for Review**:
   * A maintainer will review your PR (almost always within 24hrs)
   * Make any requested changes and update the PR, and include comments please! 

### Guidelines
* Feel free to check out the Issues tab and comment on issues you want to work on (or add you own!)
* Follow the existing code style.
* Test your changes thoroughly.
* Write descriptive commit messages.

## License

This project is open-source under the MIT License.  
You **must provide credit** if you use or distribute this code.
See the LICENSE file for more details. 
