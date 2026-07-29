# Decisions

Judgment calls made while building autonomously, with reasoning. Ordered by the
step that raised them. Anything a fresh session (or the operator) might want to
revisit lives here.

## Step 1 — scaffold

**D1. `CLAUDE.md` casing.** The spec file arrived as `claude.md`; the spec's own
header says "Save in the repo root as `CLAUDE.md`." Renamed to `CLAUDE.md` so
Claude Code reads it automatically. macOS is case-insensitive so this is
cosmetic, but it matches the spec and is correct on Linux/CI.

**D2. Content config location.** Astro 5 prefers `src/content.config.ts`, but the
spec's directory layout explicitly lists `src/content/config.ts`. Astro 5 still
fully supports the latter, so I followed the spec. No functional difference.

**D3. Added `draft` to every collection schema.** The spec's content schema only
lists `draft` on posts, but guardrail #6 says the `[FACT-CHECK]` build failure
applies only to `draft: false` files, and platform/stack files carry
`[FACT-CHECK]` / `[OPERATOR INPUT]` markers. So `platforms` and `stacks` also get
a `draft` field, defaulting to `true`. All generated content ships as
`draft: true` until the operator verifies it.

**D4. Manual scaffold instead of `npm create astro`.** The interactive creator
prompts for input, which doesn't fit an autonomous run. I wrote `package.json`,
`astro.config.mjs`, `tsconfig.json`, and the Tailwind 4 Vite plugin config
directly. Result is identical to a clean Astro 5 + Tailwind 4 project.

**D5. Category enum.** Introduced a shared `category` enum
(`grant-research`, `prospect-research`, `donor-crm`, `donation-processing`,
`forms-ops`, `events-auctions`) used by platforms, stacks, and posts so category
strings can't drift. Mirrors the "Software categories to cover" table.
