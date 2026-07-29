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

## Step 2 — affiliate system

**D6. 25 affiliate entries, not 14.** `affiliates.json` is the link source of
truth, so it covers every product the site links to (Tier A + B + C + the
free/gov tools with no program). The 14 *platform content files* (step 6) are a
subset. More link entries than content pages is expected and correct.

**D7. Tier B status = `pending`, not `none`.** Tier C is explicitly `status:
"none"` in the spec. Tier B (Kindsight, DonorSearch, Neon One) has real
negotiated programs the operator intends to pursue once the site has traffic, so
`pending` is more accurate than `none`. Redirect behavior is identical either way
(both fall back to the plain URL), so this only affects intent tracking. `none`
is reserved for products with genuinely no program.

**D8. Reader offers only where stated.** Per "never invent a number," `readerOffer`
is populated only where the spec's program table gives a reader-facing discount —
that is DonorDock's "10% off." The Instrumentl "$50 off" in the spec's JSON
*example* was illustrative, so it is left `null` for the operator to confirm.

**D9. Redirect is meta-refresh + `location.replace()`, not a true 302.** A pure
static host (Cloudflare Pages, "no serverless functions" per spec) cannot emit a
real 302 for a path that has a static file. Meta-refresh + `replace()` + `noindex,
nofollow` achieves the same SEO outcome: the hop is not indexed, no link equity
passes, and it stays out of browser history. A `_redirects` file was considered
but would be shadowed by the generated static page. Documented so it can be
revisited if the site later moves to SSR.
