# Deploying the site — a plain-language guide

This walks you through putting the site online at **nonprofitsoftwareguide.com**
using **Cloudflare Pages**, which is free for a site like this. You do not need to
be a developer. Follow the steps in order. Where a step needs a command, it's in a
gray box you can copy.

There are three one-time setups (GitHub, Cloudflare, your domain) and then a
simple routine for publishing changes. Budget about an hour for the first deploy.

---

## What you're deploying

The site is a folder of files that gets built into plain HTML — no database, no
server, nothing to maintain. Cloudflare takes your files, runs one build command,
and serves the result on a fast global network. Every time you change a file and
push it to GitHub, Cloudflare rebuilds and republishes automatically.

The build also runs the **guardrails** (the safety checks). If a page has an
unverified price left in it, the build fails and the bad page never goes live. That
is intentional — it's protecting you.

---

## Part 1 — Put the code on GitHub (one time)

GitHub stores your code and is what Cloudflare watches for changes.

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Create a new **empty** repository named `nonprofitsoftwareguide` (no README,
   no license — leave it empty).
3. On your computer, in the project folder, connect it to that repository and push.
   Replace `YOUR-USERNAME` with your GitHub username:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/nonprofitsoftwareguide.git
   git branch -M main
   git push -u origin main
   ```

   If it asks you to sign in, follow the prompts. When it finishes, refresh the
   GitHub page — your files should be there.

---

## Part 2 — Connect Cloudflare Pages (one time)

1. Create a free account at [cloudflare.com](https://cloudflare.com).
2. In the dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize Cloudflare to see your GitHub, then pick the
   `nonprofitsoftwareguide` repository.
4. On the build settings screen, enter these **exactly**:

   | Setting | Value |
   |---|---|
   | Framework preset | `Astro` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |

5. Add one environment variable so Cloudflare uses a modern Node version. Click
   **Environment variables → Add variable**:

   | Name | Value |
   |---|---|
   | `NODE_VERSION` | `22` |

6. Click **Save and Deploy**. Cloudflare will build the site (a couple of minutes)
   and give you a temporary address like `nonprofitsoftwareguide.pages.dev`. Open
   it — the site is live on that temporary address.

If the build fails, open the build log. A guardrail failure will name the exact
file and problem (for example, a price still marked `[FACT-CHECK]` on a published
page). Fix that file, push again (see Part 5), and it rebuilds.

---

## Part 3 — Point your domain at it (one time)

1. If your domain **nonprofitsoftwareguide.com** isn't already on Cloudflare, add
   it: **Cloudflare dashboard → Add a site**, enter the domain, and follow the
   steps to change your domain's nameservers at whoever you bought it from. (This
   part can take a few hours to take effect — that's normal.)
2. Once the domain is on Cloudflare, open your Pages project →
   **Custom domains → Set up a custom domain**.
3. Add `nonprofitsoftwareguide.com` and also `www.nonprofitsoftwareguide.com`.
   Cloudflare creates the DNS records for you and provisions the HTTPS certificate
   automatically.
4. Wait for the certificate to go green (usually minutes). Visit
   `https://nonprofitsoftwareguide.com` — the site is now on your real domain.

---

## Part 4 — Optional: Analytics and Search Console

The site works without these. Add them when you're ready.

- **Google Analytics 4 (traffic stats):** get your measurement ID (looks like
  `G-XXXXXXXXXX`) from analytics.google.com. In Cloudflare Pages →
  **Settings → Environment variables**, add `PUBLIC_GA4_ID` with that value, then
  redeploy (Part 5). Analytics starts collecting automatically.
- **Google Search Console (how you rank in Google):** at
  search.google.com/search-console, add your domain and choose the "HTML tag"
  verification method. Copy the `content="..."` value it gives you, add it in
  Cloudflare as `PUBLIC_GSC_VERIFICATION`, redeploy, then click Verify in Search
  Console. After that, submit your sitemap: `https://nonprofitsoftwareguide.com/sitemap.xml`.

(`.env.example` in the project lists these same variable names.)

---

## Part 5 — How to publish changes (the routine)

This is what you'll do from now on. There is no "upload" step — you just save and
push, and Cloudflare rebuilds.

1. Make your edits to the files.
2. In the project folder, run these three commands:

   ```bash
   git add -A
   git commit -m "Describe what you changed"
   git push
   ```

3. Cloudflare notices the push and rebuilds within a minute or two. Refresh the
   site to see it.

### Publishing a draft page (important)

Every generated page ships as a **draft** — hidden from Google and from the site's
own menus, and marked with a red banner. To publish one:

1. Open the file (for example `src/content/platforms/instrumentl.md`).
2. Replace every `[FACT-CHECK: ...]` with the real, verified number or fact.
3. Replace every `[OPERATOR INPUT — ...]` block with your own words.
4. Change `draft: true` to `draft: false`.
5. Push (the three commands above).

If you miss a `[FACT-CHECK]` or `[OPERATOR INPUT]` on a page you set to
`draft: false`, **the build will fail on purpose** and tell you which file — so you
can't accidentally publish an unverified page. Fix it and push again.

The `/disclosure` and `/about` pages also start hidden. Write your real disclosure
and bio in those files (they contain instructions), then remove the `noindex` line
near the top of each `.astro` file to make them public.

---

## Part 6 — Keeping it healthy

Run these on your own computer whenever you like (they don't affect the live site):

- **Check for stale prices** (anything not re-verified in 90 days):

  ```bash
  npm run check-freshness
  ```

- **Check that every affiliate link still works:**

  ```bash
  npm run check-links
  ```

- **Preview the whole site locally before pushing:**

  ```bash
  npm run dev
  ```

  Then open the address it prints (usually `http://localhost:4321`).

That's it. Save, push, done — and the guardrails keep an unverified page from ever
reaching the public site.
