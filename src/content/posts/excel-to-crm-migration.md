---
title: "Moving from Excel to a donor CRM without losing your gift history"
description: "Soft credits, households, and gift history are what break when you move from Excel to a CRM. How to clean the sheet, test the import, and go live safely."
publishDate: 2026-02-03
stack: 250k-1m
targetQuery: "excel to crm migration soft credits"
platformsMentioned: [littlegreenlight, bloomerang, donorsnap]
affiliateSlugs: [bloomerang, donorsnap]
draft: false
faq:
  - q: "What data gets damaged most often in a CRM migration?"
    a: "Gift history, soft credits, and household or relationship records. Spreadsheets rarely store these cleanly, so they arrive in the new system incomplete or attached to the wrong person. Clean them in the sheet before you import."
  - q: "Should I import my full gift history or start fresh?"
    a: "Import it. Gift history drives every report a CRM produces, from retention to lapsed-donor lists. A CRM with no history is a rolodex. Budget the cleanup time; it pays back for years."
  - q: "How do I test a CRM import before going live?"
    a: "Run the full import into the new system, then export everything back out and spot-check it against your source sheet. Pick ten donors you know well and verify totals, dates, and household links match."
---

The three things most likely to break when you move from Excel to a donor CRM are gift history, soft credits, and household records. Spreadsheets don't store any of them cleanly. Clean the sheet first, run a full test import, and spot-check the export against your source before you go live.

## What actually breaks

Excel has no per-record cost, but it also has no gift history integrity, no soft credits, and no household records. A cell that says "gave through her husband's business" is a note, not data. When that row hits a CRM importer, the credit lands on the wrong record or nowhere.

Teams that have made this move report the same failures over and over: gifts attached to duplicate contacts, spouses imported as two unrelated donors, and matching gifts counted twice. None of these are the software's fault. The sheet never held the structure the CRM expects.

## Clean the sheet before you touch an importer

Do this work in Excel, where you can see everything at once.

- **Deduplicate people first.** Merge the "Bob Smith" and "Robert Smith" rows before import, not after.
- **Split households.** One row per person, with a column linking spouses or partners. Decide now who is the primary contact.
- **Separate hard and soft credits.** The donor-advised fund is the legal donor; the family behind it gets the soft credit. Give each its own column.
- **Standardize dates and amounts.** One date format, no dollar signs in amount cells, no "pledged?" notes living inside numbers.

A weekend of this beats a year of untangling it inside the CRM.

## The test-import checklist

Every serious CRM lets you trial an import. Use it.

1. Import the full cleaned file into a trial account.
2. Export everything back out of the new system.
3. Pick ten donors you know personally. Check lifetime totals, gift dates, soft credits, and household links against the source sheet.
4. Run one report you rely on, such as last year's donors over $500, and confirm the count matches your spreadsheet.
5. Only then delete the trial data and run the real import.

If step 3 or 4 fails, fix the sheet, not the imported records.

## Where each platform helps

[Little Green Light](/go/littlegreenlight) starts at $45/mo for up to 2,500 constituents with no contracts and no setup fees, which makes it easy to trial an import at low cost. [Bloomerang](/go/bloomerang) starts around $79/mo for roughly 1,000 contacts and is known for ease of use, which matters when the person doing the import is also the person writing the appeal letters.

For the smallest teams, [DonorSnap](/go/donorsnap) is the shortcut. It runs from $39/mo for 1,000 contacts, and its one-time $200 setup fee includes data conversion and training. Someone on their side does the import work with you. For a solo development shop staring at a decade of messy tabs, paying $200 to hand that problem to a professional is a fair trade. See [our DonorSnap review](/platforms/donorsnap/) for the details.

Whichever direction you lean, book a demo and bring your actual spreadsheet. Watching a vendor's team react to your real data tells you more than any feature list.

This migration is the first upgrade most shops make in [the $250k-$1M stack](/stacks/250k-1m/).
