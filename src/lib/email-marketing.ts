// Rendering for the platform `emailMarketing` field. One place, so a buyer sees
// the same words wherever they meet the question.
export type EmailLevel = 'included' | 'basic' | 'add-on' | 'none' | 'unknown';

export const EMAIL_LABEL: Record<EmailLevel, string> = {
  included: 'Included',
  basic: 'Basic only',
  'add-on': 'Costs extra',
  none: 'No',
  unknown: 'Unconfirmed',
};

/** Longer form for the platform page, where there is room to be precise. */
export const EMAIL_MEANING: Record<EmailLevel, string> = {
  included: 'Segmented campaigns, templates and open/click tracking are part of the product.',
  basic: 'Sends receipts and simple messages, but is not a campaign tool — budget for a separate one if you run appeals by email.',
  'add-on': 'Available, but priced separately from the core subscription.',
  none: 'No email sending. You will need a separate tool.',
  unknown: 'We could not confirm this from a vendor source, so we are not guessing.',
};

/** included is the only one that answers "yes" to "can I cancel Mailchimp?" */
export const emailIsSelfSufficient = (l: EmailLevel) => l === 'included';
