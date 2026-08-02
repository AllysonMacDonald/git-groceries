# git-groceries

A shared, live grocery list. `list.md` is the single source of truth. `index.html`
displays `list.md` and auto-refreshes, so a partner can watch the list without any
account or app. The page is hosted on **Netlify**, which also runs one small
serverless function so a partner can **add items straight from their phone**.

## How it flows

**Two ways to add:**

- **Tell Claude** — from any device: **"add milk and eggs to the list."** Claude
  files each item into the right category, commits, and pushes to `main`.
- **The "Add item" box on the page** — a partner types an item and taps **Add**.
  The Netlify function `netlify/functions/add-item.js` classifies it into the
  right category (the 12 buckets below) and files it under that heading in
  `## To buy`, deduping against the whole list. No account, no login. Items the
  classifier can't place confidently land under `## Inbox` instead, and Claude
  files those by judgment on its next interaction.

Either way, the shared page picks up the change on its next poll (~20s) once the
updated file is published.

As a convenience while shopping, you can **tap any item to check it off** (strike
it through and drop it from the "to buy" count) and tap again to undo. These ticks
are saved **on that device only** (browser `localStorage`), survive refreshes, and
are not shared to the other partner's phone. "Uncheck all" clears them.

## Deploy / setup (Netlify)

The site is static — no build step. `netlify.toml` sets the publish dir to the repo
root and the functions dir to `netlify/functions`. To make the "Add item" box work,
set one environment variable in **Netlify → Site settings → Environment variables**:

- `GITHUB_TOKEN` — a fine-grained PAT for this repo with **Contents: read/write**.

Optional env vars: `GH_OWNER`, `GH_REPO`, `GH_BRANCH`, `GH_PATH` (defaults target
`allysonmacdonald/git-groceries` `main` `list.md`), and `ADD_SECRET` (if set, the
page must send a matching secret — off by default; see the note in the function).

## Capture protocol (for Claude editing this repo)

When asked to "add X to the list" / "we're out of X" / "put X on the list":

- File each item under `## To buy`, in the **right category** (see the 12 buckets
  below). Create the `###` heading if it isn't there; keep headings in the order
  listed; an item is a `- [ ] item` line.
- **Deduplicate** against everything already on the list (any category).
- No confirmation needed for a plain add — do it, commit, push, and confirm in
  one line naming the category it went to.
- When an order is placed, move ticked items to `## Ordered / done` with the date.

### The 12 categories (aisle order)

1. **Fruit & vegetables** — fresh produce, fresh herbs, salad, mushrooms.
2. **Meat, poultry & seafood** — fresh/refrigerated proteins, bacon, deli meat.
3. **Dairy & eggs** — milk, butter, cream, cheese, yogurt, eggs.
4. **Bakery** — bread, buns, bagels, tortillas, fresh pastries, cakes.
5. **Pantry staples** — dry/canned/jarred goods, pasta, rice, flour, sugar, oil,
   spices, dried herbs, cereal, condiments, baking.
6. **Frozen foods** — anything from the freezer aisle. Fresh version → its fresh
   category instead.
7. **Snacks** — chips, crackers, cookies, granola bars, nuts, candy.
8. **Beverages** — tea, coffee, juice, pop, water, non-dairy milks.
9. **Cleaning products** — dish soap, detergent, all-purpose cleaner, bleach.
10. **Household supplies** — paper towel, toilet paper, foil, bags, batteries,
    light bulbs.
11. **Personal care** — toothpaste, shampoo, deodorant, soap, meds, cosmetics.
12. **Specialty or dietary items** — allergen-specific/vegan/keto products,
    supplements, baby, pet — and the catch-all for anything unclear.

Judgment: fresh herbs → produce, dried herbs/spices → pantry. "Corn" fresh →
produce, canned → pantry, frozen → frozen. When ambiguous, pick the best fit and
note it in the one-line confirm.

## The page

`index.html` fetches `list.md` from the same origin every ~20 seconds (with a
cache-buster) and re-renders. Empty categories are hidden. Optionally you can add
` — note` after an item (e.g. `- [ ] celery — chowder`) and the note renders in a
lighter style.

Share this URL with your partner (fill in your GitHub username):

```
https://<username>.github.io/git-groceries/
```
