// Guardrail #5: cluster integrity. Every published post declares a `stack` that
// resolves to a real stack hub, and every hub links down to each published post
// that names it. Orphans fail the build. Drafts are exempt (works in progress).
import { readCollection, report } from './_lib.mjs';

const stacks = readCollection('stacks');
const posts = readCollection('posts');

const stackSlugs = new Set(stacks.map((s) => s.data.slug ?? s.slug));
const publishedPosts = posts.filter((p) => p.data.draft === false);
const publishedStacks = stacks.filter((s) => s.data.draft === false);

const failures = [];

// 1. Each published post points up to an existing hub.
for (const post of publishedPosts) {
  const stack = post.data.stack;
  if (!stack) {
    failures.push(`${post.file} has no "stack" (every post must join a cluster hub)`);
  } else if (!stackSlugs.has(stack)) {
    failures.push(`${post.file} declares stack "${stack}" but no stack hub has that slug`);
  }
}

// 2. Each published hub links down to every published post that names it.
for (const stack of publishedStacks) {
  const slug = stack.data.slug ?? stack.slug;
  const children = publishedPosts.filter((p) => p.data.stack === slug);
  for (const child of children) {
    const link = `/blog/${child.slug}`;
    if (!stack.body.includes(link)) {
      failures.push(
        `stacks/${slug}: hub does not link down to its post ${link} (${child.file})`
      );
    }
  }
}

report('cluster integrity (no orphans, hubs link down)', failures);
