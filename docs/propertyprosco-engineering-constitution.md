# PropertyProsCo Engineering Constitution v1.0

## Build Once. Scale Forever.

This document is the operating system for developers, AI agents, and contributors working in this repository.

PropertyProsCo is not a collection of pages. It is a platform for homeowners, Pros, and Realtors. Every decision should improve one or more of the following:

- user experience
- performance
- maintainability
- scalability
- accessibility
- simplicity
- conversion
- developer experience

If a feature does not improve the product or the user experience, it should not be built.

## The Golden Rule

Every feature must be:

- easy to understand
- easy to discover
- easy to use
- easy to maintain
- easy to extend
- easy to debug
- easy to replace

Complexity is a bug.

## Command

Every task follows this lifecycle:

```text
THINK -> PLAN -> BUILD -> TEST -> IMPROVE -> SHIP
```

Applied to this repo, that means:

1. Understand the user problem and business outcome.
2. Analyze existing patterns in `src/app`, `src/components`, `src/lib`, and `prisma`.
3. Plan the smallest safe implementation.
4. Build with shared components and server-safe logic.
5. Test and verify with repo scripts.
6. Simplify the result before shipping.

## Rule 1 - User First

Every decision should answer:

> Does this make the user's experience faster, simpler, and more intuitive?

If not, redesign it.

PropertyProsCo-specific lens:

- Homeowners should post, compare, and hire with minimal friction.
- Pros should reach leads, messages, quotes, and billing with fewer clicks.
- Realtors should manage clients, referrals, and projects without workflow confusion.

## Rule 2 - Design System First

Never create one-off components when a shared pattern already exists.

Use the shared layers first:

- layout primitives in `src/components/layout`
- branding and empty states in `src/components/brand`
- role and feature components in `src/components/*`
- shared style tokens in `tailwind.config.ts`
- app-wide styles in `src/app/globals.css`

Every page should be assembled from reusable building blocks before new abstractions are introduced.

## Rule 3 - Mobile First

Design and validate features in this order:

```text
320px
640px
768px
1024px
1280px
1536px+
```

Desktop is an enhancement. Mobile is the foundation.

Use the existing container spacing standard already present in `src/components/layout/Container.tsx`:

```text
mx-auto
px-4
sm:px-6
lg:px-8
```

Avoid horizontal scrolling, clipped text, and fixed-width layouts unless there is a clear product reason.

## Rule 4 - No Hardcoded Values

Do not hardcode:

- URLs
- colors
- API keys
- secrets
- database values
- validation rules that belong in shared code
- plan or billing identifiers
- environment-specific text

Source values from:

- environment variables
- shared constants
- configuration in `src/lib`
- Prisma schema and database records
- shared Tailwind theme tokens

## Rule 5 - One Source of Truth

Each resource should exist once and be reused:

- colors and typography in `tailwind.config.ts` and `globals.css`
- routes and role access in `src/lib/role-routes.ts` and route structure
- billing definitions in `src/lib/billing-config.ts`
- validation in shared helpers and server routes
- environment requirements in `src/lib/env.ts` and `scripts/env-contract.ts`

Duplicate logic is a maintenance cost.

## Rule 6 - Feature Ownership

New work should keep code grouped by feature or domain as much as possible, even though the current codebase is primarily organized by route segments.

For new features, prefer a predictable split across:

- route entrypoints in `src/app`
- shared or feature components in `src/components`
- business logic and guards in `src/lib`
- schema and persistence in `prisma`
- tests in `tests`

Do not trigger a large refactor just to satisfy this rule. Apply it forward to new work.

## Rule 7 - API Before UI

Build features in this order:

```text
database
business logic
API or server action
hook or client bridge
component
page
```

Never bury business logic directly inside page components when it belongs in shared server-side code.

## Rule 8 - Design Consistency

The application should feel like one product across marketing, homeowner, pro, and realtor surfaces.

Keep these consistent:

- typography
- colors
- border radius
- shadows
- spacing
- navigation patterns
- button behavior
- loading states
- empty states
- success and error messaging

## Rule 9 - Performance First

Speed is a feature.

Every feature should consider:

- minimizing client-side JavaScript
- avoiding redundant network requests
- paginating large data sets
- caching where safe
- lazy loading when practical
- image optimization
- rendering only what the current screen needs

Do not add complexity in the name of optimization if simpler code already meets the product need.

## Rule 10 - Accessibility First

Every page and workflow must support:

- keyboard navigation
- visible focus states
- semantic HTML
- screen-reader-friendly labels
- contrast that preserves readability
- clear interactive affordances

Accessibility is required, not optional.

## Rule 11 - Error Handling

Every action should define:

- loading
- success
- error
- empty state
- retry path
- safe fallback

No silent failures. No dead-end screens.

## Rule 12 - Logging And Observability

Every important system action should be traceable.

At minimum, log or make observable:

- request intent
- validation failures
- auth failures
- external-service failures
- database write failures
- billing and webhook failures
- unexpected runtime errors

When possible, keep logs aligned with the feature and route they belong to.

## Rule 13 - Layout Standards

Prefer shared containers over ad hoc page wrappers.

Standards for this repo:

- `mx-auto`
- `px-4 sm:px-6 lg:px-8`
- shared `Container` usage when practical
- max widths that fit the context without causing line-length or density problems

Never ship:

- horizontal scroll caused by layout mistakes
- overflowing cards
- truncated critical actions
- text clipped by fixed heights

## Rule 14 - Authentication And Permissions

Authentication and authorization must degrade gracefully and stay server-safe.

Support and protect:

- email and password
- password reset
- session management
- protected routes
- role-based access
- admin-safe and internal-safe actions

Sensitive checks belong on the server, not only in the UI.

## Rule 15 - Component Simplicity

If a component becomes too large to understand quickly, split it.

Guidance:

- around 300 lines for components is a warning sign
- around 50 lines for a function is a warning sign

Small, readable units scale better than clever large files.

## Rule 16 - Debugging Protocol

Never guess. Debug with evidence.

Use this order:

```text
browser console
network requests
API response
server logs
database
environment variables
business logic
```

For this repo, always check the matching route, shared server helper, and env contract before rewriting UI code.

## Rule 17 - Before Every Commit

Verify:

- no TypeScript errors
- no obvious console errors
- no layout overflow
- mobile works
- tablet works
- desktop works
- forms validate
- auth still works for the touched flow
- loading, error, and empty states exist where relevant

Recommended commands:

```bash
npm run qa:check
```

## Rule 18 - Before Every Deployment

Run:

```bash
npm run release:check
```

This should cover the current repo validation chain before production release.

## Rule 19 - Competitor Advantage

Compare major flows against:

- Zillow
- Redfin
- Realtor.com
- Airbnb
- Compass
- LoopNet

Do not copy them.

Improve them by shipping:

- fewer clicks
- clearer search and filtering
- faster perceived load time
- cleaner mobile UX
- stronger onboarding
- simpler billing and account flows

PropertyProsCo should feel easier to adopt than the products users already know.

## Rule 20 - AI Collaboration

AI is a senior implementation partner, not the product architect.

AI may:

- generate code
- refactor code
- explain code
- debug code
- document code

AI may not:

- change architecture without analysis
- delete functionality without impact review
- replace reusable components with one-off duplicates
- introduce breaking changes casually
- ignore the design system or repo workflow

AI must inspect existing patterns before proposing new ones.

## The 80/20 Principle

Always ask:

> What is the smallest amount of code that creates the best user experience?

Prefer:

- simple
- reusable
- readable
- documented
- scalable

Over:

- complex
- clever
- overengineered
- fragile
- unnecessary

## Final Mission Statement

PropertyProsCo should feel effortless.

Users should complete tasks with minimal thinking, minimal clicks, and maximum confidence.

Developers should understand the codebase quickly, extend features safely, debug with predictable workflows, and scale the platform without rewriting entire systems.

Every improvement should move PropertyProsCo toward becoming the fastest, simplest, and most intuitive real-estate platform in its category while maintaining enterprise-grade quality, reliability, and performance.
