import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// RSS of published posts, newest first. Drafts are excluded.
export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => data.draft === false)).sort(
    (a, b) => +b.data.publishDate - +a.data.publishDate
  );

  return rss({
    title: 'Nonprofit Software Guide',
    description:
      'The nonprofit fundraising stack, organized by shop size: grant research, wealth screening, processing, and the CRM last.',
    site: context.site ?? 'https://nonprofitsoftwareguide.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
