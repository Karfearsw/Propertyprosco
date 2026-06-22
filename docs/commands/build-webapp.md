# `/build-webapp`

Use this command when you want an AI agent or contributor to build a PropertyProsCo feature from design through debugging using the repo's preferred workflow.

## Purpose

This command turns a feature request into a predictable delivery flow that favors:

- simplicity over cleverness
- reuse over one-off code
- mobile-first UX
- fast onboarding and rapid adoption
- easy debugging
- competitive advantage through fewer clicks and cleaner workflows

## Copy-Paste Command

```text
/build-webapp

Goal:
[Describe the business outcome in one paragraph.]

Audience:
[Homeowner, Pro, Realtor, Admin, or Marketing visitor.]

Success Criteria:
- [Outcome 1]
- [Outcome 2]
- [Outcome 3]

Affected Areas:
- Routes: [list route segments in src/app]
- Components: [existing or new files in src/components]
- Business logic: [files in src/lib]
- Data/API: [Prisma, route handlers, server actions, webhooks, env impact]

Competitive Benchmark:
- Compare against: [Zillow / Redfin / Realtor.com / Airbnb / Compass / LoopNet]
- Win by: [fewer clicks / faster load / cleaner mobile UX / simpler onboarding / better trust]

Constraints:
- Reuse existing patterns before creating new ones.
- Keep secrets and sensitive logic server-side.
- Keep UI mobile-first and accessible.
- Add only the minimum code needed for a production-safe result.

Execution Rules:
1. THINK
   - Inspect the repo before proposing changes.
   - Find existing patterns in `src/app`, `src/components`, `src/lib`, `prisma`, and `tests`.
   - Identify the likely root cause before rewriting code when debugging.
2. PLAN
   - Summarize goal, affected files, DB/API impact, risks, and implementation steps.
   - Keep the approach aligned with the engineering constitution.
3. BUILD
   - Implement in this order: data -> business logic -> API/server layer -> components -> page.
   - Reuse `src/components/layout`, shared brand components, Tailwind tokens, and existing feature flows.
   - Avoid hardcoded values that belong in env, config, constants, or data.
4. TEST
   - Verify loading, success, error, empty, retry, and fallback states.
   - Check mobile, tablet, and desktop.
   - Run the appropriate repo commands.
5. IMPROVE
   - Simplify the implementation.
   - Remove duplicate logic.
   - Tighten naming, structure, and UX.

Required Quality Checks:
- Accessibility: semantic HTML, labels, focus states, keyboard flow
- Performance: no unnecessary requests or oversized client logic
- Debuggability: clear logs, traceable failures, predictable states
- Consistency: matches PropertyProsCo styles, voice, and interaction patterns

Required Verification Commands:
- `npm run qa:check`
- `npm run build` when the change affects production behavior
- `npm run release:check` before deployment-sensitive work

Output Format:
1. Recommendation
2. Exact code or file changes
3. Risks
4. Next step
```

## How To Use It Well

Use this command for:

- new product flows
- major page rewrites
- onboarding improvements
- search and conversion improvements
- billing or dashboard work
- debugging a broken feature from first principles

Do not use it to justify a large refactor unless the current structure blocks a safe implementation.

## Build Order

Follow this order inside the repo:

1. `prisma/` when schema or data changes are required
2. `src/lib/` for business logic, guards, and utilities
3. `src/app/api/` for route handlers and server entrypoints
4. `src/components/` for reusable UI pieces
5. `src/app/` for route pages and layouts
6. `tests/` for focused regression coverage when it materially reduces risk

## Debugging Order

When something fails, use evidence in this order:

1. browser console
2. network request and response
3. route handler or server output
4. database state
5. environment contract
6. business logic
7. UI rendering assumptions

## Simplicity Filter

Before shipping, ask:

- Is there a smaller implementation that preserves the same user outcome?
- Did we reuse an existing component or helper where possible?
- Does the user have a clear next action at every step?
- Is this easier to adopt than a comparable competitor flow?
