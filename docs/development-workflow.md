# PropertyProsCo Development Workflow

Use this workflow for day-to-day feature work, bug fixes, and release preparation in this repository.

## Working Loop

```text
THINK -> PLAN -> BUILD -> TEST -> IMPROVE -> SHIP
```

## 1. Think

Start by understanding the user problem and the business outcome.

Questions to answer:

- Who is this for: homeowner, pro, realtor, admin, or marketing visitor?
- What is the desired behavior?
- What is broken or missing today?
- What should become faster, clearer, or easier than competitor flows?

Inspect current patterns before building:

- routes in `src/app`
- shared UI in `src/components`
- business logic in `src/lib`
- schema in `prisma/schema.prisma`
- tests in `tests`

## 2. Plan

Before major work, summarize:

1. goal
2. affected files
3. DB or API impact
4. risks
5. implementation steps

Prefer the smallest safe implementation that improves UX and keeps the codebase easy to extend.

## 3. Build

Use this order:

1. data model
2. shared business logic
3. API or server entrypoint
4. reusable component
5. page or layout

Repo-specific guidance:

- keep sensitive operations server-side
- reuse Tailwind tokens from `tailwind.config.ts`
- prefer shared layout patterns from `src/components/layout`
- avoid hardcoded values that belong in env, constants, config, or data
- keep role-based flows aligned with the existing route structure

## 4. Test

Always test the states that users actually hit:

- loading
- success
- error
- empty
- retry
- fallback

Check responsive behavior on:

- mobile
- tablet
- desktop

Run the repo commands that match the risk level:

```bash
npm run qa:check
```

For deployment-sensitive or production-facing work, also run:

```bash
npm run release:check
```

## 5. Improve

Before shipping, simplify:

- reduce duplicate logic
- tighten naming
- extract reusable pieces
- remove dead code
- confirm the user has a clear next action

If the result feels clever but harder to maintain, simplify it again.

## 6. Ship

Before release:

- confirm env requirements are satisfied
- confirm build passes
- confirm auth, billing, and role-based behavior still make sense for the touched flow
- confirm the change improves simplicity, not just functionality

## Debugging Protocol

Never guess. Follow this order:

1. browser console
2. network request
3. API response
4. server logs
5. database state
6. environment variables
7. business logic

Look for the root cause before rewriting working code.

## Commands

Use these commands regularly:

```bash
npm run prisma:validate
npm run validate:env
npm run typecheck
npm test
npm run qa:check
npm run build
npm run release:check
```

## Related Docs

- `docs/propertyprosco-engineering-constitution.md`
- `docs/commands/build-webapp.md`
- `AGENTS.md`
