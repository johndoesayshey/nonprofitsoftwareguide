// SEO requirement: no thin pages. Published content must clear a minimum body
// word count or the build fails (index bloat from thin pages suppresses the whole
// domain). Drafts are exempt. Thresholds are deliberately moderate — platform
// pages carry structured tables, so they need less prose than a blog post.
import { readCollection, report } from './_lib.mjs';

// Platform pages are deliberately concise (the operator's call): the rendered
// page adds a pricing table, strengths/limitations, and CTAs from frontmatter,
// so the markdown body floor is lower than it looks.
const MIN_WORDS = { posts: 450, stacks: 350, platforms: 150, alternatives: 300, guides: 350 };

function wordCount(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ') // drop code fences
    .replace(/[#>*_`|\-]/g, ' ') // drop common markdown punctuation
    .split(/\s+/)
    .filter(Boolean).length;
}

const failures = [];

for (const [name, min] of Object.entries(MIN_WORDS)) {
  for (const entry of readCollection(name)) {
    if (entry.data.draft !== false) continue; // only published pages must be deep
    const words = wordCount(entry.body);
    if (words < min) {
      failures.push(`${entry.file} is thin: ${words} words (min ${min} for ${name})`);
    }
  }
}

report('minimum depth (no thin published pages)', failures);
