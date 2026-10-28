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

The fixed current palette lives in `:root` in `src/app/globals.css`, loaded by
`src/pages/_app.tsx`. Color variables store space-separated RGB channels so
Tailwind opacity modifiers work, for example `bg-action/20`.

Tailwind's default colors and numbered shades remain available. Prefer role
utilities such as `bg-background text-foreground`,
`bg-surface text-muted-foreground border-border`, and
`bg-action text-action-foreground`. Difficulty, study state, and status colors
have separate `difficulty-*`, `study-*`, and `status-*` names.

Existing names remain compatibility aliases: `primary` is still white,
`secondary` is still muted text, and bare `blue`/`neutral` retain their original
values alongside numbered shades. Migrate hardcoded colors by their role rather
than changing those aliases globally. `bg-grey` consistently means the palette's
gray; the dark whiteboard color-picker surface uses `bg-surface-inset`.
Unspecified borders retain `currentColor` during migration; use `border-border`
when a component needs the shared border color.

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
current palettes. Legacy names stay available for compatibility. There is no
theme toggle.

Use `cssColor(token, opacity?)` from `src/lib/colors.ts` for inline DOM/SVG styles.
Canvas and Chart.js require `canvasColor(token, opacity?)`, which reads the CSS
channels and returns a resolved color. Use `hexColor(token)` for libraries that
parse hex explicitly, such as Joyride's primary color. Canvas values are resolved
on the client; server rendering has safe placeholders. Charts resolve colors
when their data/options are built. Whiteboard tool colors use named ink tokens,
while saved paths keep their resolved hex colors so palette edits cannot change an
existing drawing.

`src/styles/vendor-colors.css` preserves the installed Ace One Dark,
highlight.js Atom One Dark Reasonable, NProgress, and React Tooltip colors with
token-based overrides. Third-party layout/behavior and static logo/image artwork
remain with their original packages/assets. The app-wide palette tests check
source boundaries, variable references, generated utilities, and those library
color overrides; runtime helper and whiteboard tests cover the non-CSS consumers.
Tailwind's default shadows, placeholder shade, and ring colors also reference
shared variables while retaining their original values and geometry.

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

Important note: do NOT use built-in Tailwind utility classes (like blue-500, grey-200, etc.) when using colors for styling, as they will not work. Either use the custom ones in @tailwind.config.ts, or hardcode the hex of the color (like this: bg-[#FFFFFF])

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
