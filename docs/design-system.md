# Repcode shared UI system

The shared component migration is in place. The follow-up audit completed
keyboard-accessible Manual Entry, all dashboard help bubbles, and separation of
domain badges. Chat rich-content and specialized chart-wrapper consolidation
remain outside the current scope by user request. The current appearance is
preserved through shared recipes. A visual redesign should change the tokens and
recipes, then review all their callers. There is no theme switch.

## Component inventory

| Area | Shared components | Main consumers |
| --- | --- | --- |
| Actions | Button | All feature actions, icon controls, and CTA links |
| Forms | Input, Textarea, NativeSelect, Select, Label, Field, InputGroup, Checkbox, RadioGroup, Slider | Dialogs, settings, search, chat, contact, chart selectors |
| Presentation | Card and parts, Badge, DifficultyBadge, StudyStateBadge, Separator, Avatar, Alert | App routes, public pages, previews |
| Feedback | Spinner, LoadingState, Skeleton, Empty and parts, useToast/Toaster | Loading, empty results, pending AI work, notifications |
| Dialogs | Dialog and parts, AlertDialog, ConfirmationDialog | Every feature modal and destructive confirmation |
| Context | DropdownMenu, Popover, Tooltip/HelpTooltip | Workspace and row menus, whiteboard color picker, explanatory help |
| View state | Tabs, ToggleGroup, Resizable | Workspaces, dashboard ranges, charts, whiteboard tools, editor split |
| Navigation | Collapsible, Button navigation variants | Sidebar, guide contents, problem-form Manual Entry, and public mobile navigation |
| Structure | AppShell, PublicShell, AuthShell | Seven authenticated routes and five public content pages; login and its mobile notice |
| Content | Table and parts, TableContainer, AspectRatio/MediaFrame, Heading, Prose, ScrollArea | Problem lists, guide/reference tables, all video embeds, headings, rich content, bounded scroll regions |

## Ownership

- `src/styles/globals.css`, `src/lib/colors.ts`, `tailwind.config.ts`, and the shared
  CSS variables own application colors. Temporary palette aliases have been retired; components use semantic roles.
- `src/components/ui` contains repository-owned shadcn-style components. Radix
  supplies interaction behavior. `components.json` describes the generator setup.
- Call sites own values, business rules, layout, and events. Components own
  spacing within controls, colors, borders, typography, shadows, and states.
- `src/components/layout` owns page landmarks and repeated navigation/footer
  placement, including legal-page spacing below the fixed navbar. `AuthShell` keeps login’s centered authentication layout and its existing mobile notice.
- `components/ui/Badge.tsx` owns generic badge presentation.
  `components/app/ProblemBadges.tsx` composes `DifficultyBadge` and
  `StudyStateBadge`, preserving domain colors, icons, size, and foreground
  overrides. Shared UI has no dependency on these domain rules.
- `ProblemWorkspace` composes tabs, menus, and the resizable editor split. Views
  remain mounted after their first visit, preserving chat/sketch/editor state.
- `components/ui/typography.module.css` owns imported problem markup; `Prose` gives it the
  correct scope. `formatProblemContent` formats code and colors; it is not an
  HTML sanitizer.
- `styles/vendor-colors.css` owns token overrides for Ace, highlight.js, and
  NProgress. Editor behavior, chart canvas rendering/tooltips, whiteboard drawing,
  guided tours, and decorative illustrations stay with their specialized code.

## Scrolling and responsive content

Normal pages scroll with the document. Problem routes use a locked viewport
shell and independent workspace panes. Use `ScrollArea` for bounded native
scrolling and set `direction` explicitly when horizontal or both directions are
needed. Tables use `TableContainer`; tab strips handle their own horizontal
overflow. Code blocks and Ace retain native horizontal scrolling. Dialogs use
Radix scroll locking and their existing bounded content recipes.

Wrap embedded media in `MediaFrame`; its default ratio is 16:9. Put maximum width
and margins on the frame and fill it with the iframe/video. Use meaningful media
titles. Keep raster/logo artwork as assets, and preserve intrinsic image ratios.

`Heading` separates semantic heading level (`as`) from visual size, weight, and
tone. Use the appropriate document hierarchy. `Prose` has separate problem,
preview, and legal recipes. Tables keep native semantics; use headers and actual
links for navigation rather than relying exclusively on clickable rows.

## Extending and verifying

Reuse a component recipe before adding a new one. Add new variants only for a
repeated visual role. Compose business UI in feature folders. Do not introduce a
second generic implementation for menus, dialogs, buttons, forms, or feedback.
Use named exports, typed native props, forwarded refs where needed, and `cn`.

Run `npm test -- --runInBand`, `npx tsc --noEmit`, `npm run lint`, and a production
build. Jest covers auth/API boundaries, control interactions, feature submission,
focus restoration, retained workspace state, rendering, and source conventions.
Browser review is still required for responsive geometry, pointer resizing,
scrolling, and visual appearance. Mocked tests do not replace a live provider or
production database check.

## Stylesheet ownership

The final CSS cleanup is complete. `pages/_app.tsx` is the sole global stylesheet
loader. It loads the Tailwind/palette entry at `styles/globals.css`, original
vendor styles, then `styles/vendor-colors.css`. Global CSS contains no component
classes or keyframes. Import a colocated `.module.css` from its owning component
when utilities are insufficient. Navigation, dialog, toast, typography, and
public-anchor rules have explicit owners; component-scoped chat and queue styles
remain local.

The temporary colors (`primary`, `secondary`, `base_100`, `divide`, bare `blue`,
`grey`, and the other old aliases) are removed. All live callers use semantic
roles. Count badges and collection progress tracks use `surface-count`; overdue notices use
`status-overdue`. Tailwind's normal numbered palettes remain available. Shared
component variant names such as Button's `secondary` are independent of retired
color names and remain supported.

Old calendar/button/modal/slide CSS, the inactive theme hook, and unused variables
from those implementations are removed. Historical drawings still retain their
saved colors. The cleanup preserves rendering and does not change chat parsing,
chart calculations, authentication, or persistence.
