// Rendering for the platform `features` map. One place, so the same words appear
// wherever a buyer meets the question.
export type FeatureLevel = 'included' | 'basic' | 'add-on' | 'none' | 'unknown';

export const LEVEL_LABEL: Record<FeatureLevel, string> = {
  included: 'Yes',
  basic: 'Basic',
  'add-on': 'Extra cost',
  none: 'No',
  unknown: '?',
};

/** Spelled out for the platform page and for screen readers in the matrix. */
export const LEVEL_MEANING: Record<FeatureLevel, string> = {
  included: 'Included in the core product',
  basic: 'Present but limited — not enough to cancel a dedicated tool',
  'add-on': 'Available at extra cost',
  none: 'Not available',
  unknown: 'Not confirmed from a vendor source',
};

/** Five, not nine. Each one maps to a subscription a small shop is realistically
 *  paying for separately — Mailchimp, a donation platform, a processor,
 *  Eventbrite, a peer-to-peer tool. That is what makes the chart a decision aid
 *  rather than a directory. Things every CRM claims ("campaign fundraising",
 *  "reporting") are deliberately absent: a row where everyone scores the same
 *  helps nobody choose. */
export const FEATURE_ORDER = [
  'emailMarketing',
  'donationForms',
  'paymentProcessing',
  'events',
  'peerToPeer',
] as const;

export const FEATURE_LABEL: Record<string, string> = {
  emailMarketing: 'Email marketing',
  donationForms: 'Donation forms',
  paymentProcessing: 'Payment processing',
  events: 'Events & ticketing',
  peerToPeer: 'Peer-to-peer',
};

/** What a buyer is really asking: how many separate subscriptions does this one
 *  product let me cancel? Only `included` counts — "basic" is why people end up
 *  paying for two tools anyway. */
export function consolidationScore(f: Record<string, FeatureLevel> = {}): number {
  return FEATURE_ORDER.filter((k) => f[k] === 'included').length;
}
