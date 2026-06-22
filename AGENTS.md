# PropertyProsCo AI Operating Rules

This file governs AI-assisted work in this repository.

## Mission

Build PropertyProsCo as a fast, simple, reusable, and scalable platform for homeowners, Pros, and Realtors.

Every change should improve at least one of these:

- user experience
- simplicity
- maintainability
- performance
- accessibility
- conversion
- debugging clarity
- speed of shipping

## Core Command

Every task follows:

```text
THINK -> PLAN -> BUILD -> TEST -> IMPROVE -> SHIP
```

## Required Behavior

### 1. Think Before Building

- Inspect the existing repo before proposing new structures.
- Search `src/app`, `src/components`, `src/lib`, `prisma`, and `tests` for reusable patterns first.
- When debugging, identify the likely root cause before rewriting large sections.

### 2. Reuse Before Creating

- Prefer shared components over one-off UI.
- Prefer shared helpers in `src/lib` over duplicated route logic.
- Prefer existing Tailwind tokens in `tailwind.config.ts` and styles in `src/app/globals.css`.
- Do not create duplicate flows when a current role-based or billing pattern already exists.

### 3. Build In The Correct Order

Implement features in this order whenever practical:

1. data model
2. business logic
3. API or server action
4. reusable component
5. page or layout

Do not bury business logic directly inside large page components without a clear reason.

### 4. Keep It Mobile-First

- Design for the smallest screen first.
- Verify mobile, tablet, and desktop behavior for touched flows.
- Avoid overflow, clipped actions, and horizontal scroll.

### 5. Keep It Accessible

- Use semantic HTML.
- Preserve visible focus states.
- Ensure forms and interactive elements have clear labels.
- Make keyboard navigation viable for the touched flow.

### 6. Always Define States

For user-facing actions, account for:

- loading
- success
- error
- empty
- retry
- fallback

No silent failures.

### 7. Keep Sensitive Logic Server-Side

- Never expose secrets in client code.
- Keep auth, billing, permissions, and sensitive mutations on the server.
- Validate inputs before database writes or external API calls.

### 8. Follow Repo Structure

Use current repo surfaces:

- `src/app` for routes, pages, layouts, and route handlers
- `src/components` for shared and feature UI
- `src/lib` for business logic, guards, and configuration
- `prisma` for schema and migrations
- `tests` for focused automated coverage

Module-oriented structure is a forward standard, not a reason to reorganize the whole repo unnecessarily.

### 9. Compare Against Competitors

When designing or refining major flows, compare against:

- Zillow
- Redfin
- Realtor.com
- Airbnb
- Compass
- LoopNet

Do not copy them. Win by shipping fewer clicks, clearer onboarding, cleaner mobile UX, and easier trust-building.

### 10. Verify Before Hand-Off

Run or recommend the right commands before considering work complete:

```bash
npm run qa:check
```

For production-sensitive work:

```bash
npm run release:check
```

## Required Planning Format For Major Work

Before implementing major features, summarize:

1. goal
2. affected files
3. DB or API impact
4. risks
5. implementation steps

## Debugging Protocol

Never guess. Use evidence in this order:

1. browser console
2. network requests
3. API response
4. server logs
5. database
6. environment variables
7. business logic

## Output Expectations

For major requests, AI responses should prefer this format:

1. recommendation
2. exact code or config
3. risks
4. next step

## Do Not

- do not invent a parallel design system
- do not replace reusable components with duplicates
- do not change architecture without analysis
- do not remove functionality without checking impact
- do not introduce unnecessary abstraction
- do not optimize away clarity

## Related Docs

- `docs/propertyprosco-engineering-constitution.md`
- `docs/development-workflow.md`
- `docs/commands/build-webapp.md`
