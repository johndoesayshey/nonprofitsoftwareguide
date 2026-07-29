# Build progress

Running log of the 12-step work order in `CLAUDE.md`. A fresh session can resume
from here. Each step is committed separately.

## Status

| Step | What | State |
|---|---|---|
| 1 | Scaffold Astro + Tailwind + content collections | ✅ done |
| 2 | Affiliate system (affiliates.json, /go/[slug], components) | ✅ done |
| 3 | Five guardrail scripts wired into build | ✅ done |
| 4 | Layouts, design system, 3 design options, homepage | ✅ done |
| 5 | Stack / platform / compare / blog / disclosure / about pages | ✅ done |
| 6 | 14 platform files | ✅ done |
| 7 | 4 stack files | ✅ done |
| 8 | content-calendar.md (30 posts) | ✅ done |
| 9 | link-targets.md (25 targets) | ✅ done |
| 10 | Sitemap, RSS, meta, JSON-LD, GA4/GSC env | ✅ done |
| 11 | Draft first 3 posts | ✅ done |
| 12 | DEPLOY.md | ✅ done |

**All 12 work-order steps complete.** Full build green (73 pages), all guardrails
passing. Everything generated ships `draft: true` — see DEPLOY.md Part 5 for how to
verify and publish. Remaining owner tasks: fill `[FACT-CHECK]` prices, write
`[OPERATOR INPUT]` slots + the `/about` bio + `/disclosure` text, then flip pages to
`draft: false`.

## Environment notes

- Astro 5.18, Tailwind 4 (via `@tailwindcss/vite`), TypeScript strict.
- `npm install` needs `--cache /tmp/npmcache-nsg` on this machine (a `~/.npm`
  permission quirk). Plain `npm run dev` / `npm run build` are unaffected.
- Content collections use the Astro 5 glob loader. Config lives at
  `src/content/config.ts` per the spec's directory layout.
- `npm run build` runs `npm run guardrails` first (5 scripts), then `astro build`.

## Decisions

See `DECISIONS.md` for the reasoning behind each judgment call.

## Step 1 — done

- `npm run dev` verified: HTTP 200 on `http://localhost:4321/`.
- Placeholder homepage; real design comes in step 4.
