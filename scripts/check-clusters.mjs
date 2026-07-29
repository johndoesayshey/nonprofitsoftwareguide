// Guardrail #5a (source): no orphan posts. Every published post must declare a
// `stack` that resolves to a real stack hub. A post with no hub will not rank.
// The complementary "hub links down to each post" check runs post-build on the
// rendered HTML (check-cluster-links.mjs), because the stack template auto-renders
// those links rather than hard-coding them in markdown.
import { readCollection, report } from './_lib.mjs';

const stacks = readCollection('stacks');
const posts = readCollection('posts');

const stackSlugs = new Set(stacks.map((s) => s.data.slug ?? s.slug));
const failures = [];

for (const post of posts) {
  if (post.data.draft !== false) continue; // drafts are exempt
  const stack = post.data.stack;
  if (!stack) {
    failures.push(`${post.file} has no "stack" (every post must join a cluster hub)`);
  } else if (!stackSlugs.has(stack)) {
    failures.push(`${post.file} declares stack "${stack}" but no stack hub has that slug`);
  }
}

report('cluster integrity — no orphan posts', failures);
