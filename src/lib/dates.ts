// Date formatting helpers. Frontmatter dates like `2026-07-28` parse as UTC
// midnight; formatting them in a timezone behind UTC would shift them back a day
// ("Jul 27"). Always format in UTC so a date displays exactly as it was authored.
const UTC = 'UTC';

export function formatLong(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: UTC });
}

export function formatMedium(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: UTC });
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: UTC });
}
