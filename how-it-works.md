# How the grocery system works

Lives in the **git-groceries** GitHub repo (local clone
`~/Desktop/git-groceries`, remote github.com/AllysonMacDonald/git-groceries).
`list.md` is the source of truth. The capture protocol and the 12 aisle
categories live in `README.md` — read that for how to file new items.

## Files
- `list.md` — the live list. Source of truth.
- `staples.md` — recurring items to keep stocked.
- `recipes.md` — saved recipes; ingredients (for the list) + method (for cooking).
- `preferences.md` — the family food profile the weekly planner reads.
- `README.md` — capture protocol + the 12 categories.
- `index.html` — the GitHub Pages page that renders `list.md` + this week's recipes.
- `how-it-works.md` — this file: ordering cadence, staples, recipes, meal planning, Instacart watch.

## The shared page (GitHub Pages)

`index.html` is served at **https://allysonmacdonald.github.io/git-groceries/** —
read-only, auto-refreshes ~20s, no account needed. Both partners bookmark it.
To change the list, Claude edits `list.md`, commits, and pushes to `main`;
GitHub Pages rebuilds in ~1–2 min. (This replaced the old Claude Artifact page
and its weekly re-share step, which are retired.)

## Recipes → list

"add Seafood Chowder to the list" drops that recipe's whole ingredient list onto
`## To buy`, each ingredient filed to its category, deduped against what's there.
File each ingredient with the recipe's short tag as its ` — note` (e.g.
`— chowder`) so the recipe shows up on the page automatically (see below).

## Weekly meal planning (the weekly six)

Every **Monday at 9:00 am** the planner picks **6 dinners** for the week and adds
their ingredients to the grocery list — so nobody has to think up meals. It reads
`preferences.md` (allergies, cuisines, dislikes, kid-cooking limits, family size)
and follows these rules:

- **The mix:** 2 vegetarian (lacto-ovo) · 2 simple meat-and-veg · 2 kid-friendly
  (one no-heat for the 8-year-old, one stovetop/oven for the 12-year-old).
- **Constraints:** ~30-min weeknight dinners, mild (kid palates); vary cuisines
  and proteins across the six and week to week; avoid repeating a recipe from the
  last ~3–4 weeks.
- **Sourcing (half new, half favorites):** each week source ~3 **new** recipes
  from outside the collection (Claude's knowledge + the web) and reuse ~3 from
  `recipes.md`, never repeating the last ~3–4 weeks. Every new recipe is written
  into `recipes.md` in the standard format (with a `<!-- tags: … -->` line), so
  the collection keeps growing.
- **To the list:** file every ingredient onto `## To buy`, each in the right
  aisle, deduped against the whole list, tagged with its recipe (e.g.
  `— sheet-pan chicken`). This is an **auto-add** — the six land on the list
  without waiting for approval; Allyson can swap or remove any afterward.

The six then show up on the page automatically (see below), since their
ingredients are now on the list.

Early on Claude sources the recipes fresh from `preferences.md`. As `recipes.md`
fills up, the planner mostly rotates through that collection, adding the
occasional new dish.

## Recipes on the page

`index.html` also renders `recipes.md` below the list as collapsible cards, but
only for recipes tied to this week's list — it matches list items' ` — note` tags
against each recipe's `<!-- tags: … -->` line (falling back to the title). Recipe
ingredient checkboxes are a per-device cooking checklist and don't touch `list.md`.

## Staples nudge

Before the weekly nudge, read `staples.md` and flag any staple not already on the
live list — respecting the "Never auto-add" section.

## Ordering protocol (PC Express / Loblaws — weekly)

Claude can't place or pay for a PC Express order (no consumer API; payment is
behind their login). "Automatic" means: keep the list submit-ready and hand it
over on cadence for a one-tap submit.

Each Saturday nudge:
1. Read `staples.md`; flag any staple not on the live list (skip "Never auto-add").
2. Present the consolidated `## To buy` list, grouped for fast entry.
3. Allyson submits in the PC Express app (reorder-past-order is the fast path)
   and picks a slot.
4. Once submitted, move ordered items to `## Ordered / done` with the date.

## Watching for: Instacart → Claude in Canada

Instacart is the only grocer building real agentic ordering, and it delivers
from Loblaws in Canada. When its Claude connector reaches Canadian accounts,
switch the weekly nudge to feed an Instacart cart Allyson approves (it still
won't pay unattended).

- Instacart↔Claude connector — announced 2026-04-23, live for US customers.
- In-app AI Cart Assistant — full US + Canada rollout "coming months" (Q1 2026).
- Composio Instacart toolkit — only creates cart/recipe *links* you check out
  yourself; Canada support unconfirmed; needs Composio + Instacart accounts.
  Not worth setup unless Allyson wants the "one-tap cart from my list" upgrade.

### Check log
- **2026-07-23:** searched this Claude Code environment's connector registry —
  no Instacart/grocery connector available to add. A monthly scheduled task
  (`instacart-canada-check`) re-checks on the 1st and appends results here.
- **2026-08-01:** grocery system migrated from the old `~/Desktop/groceries`
  Artifact setup to this GitHub repo + Pages. Instacart/Canada status carried
  forward unchanged; the monthly check continues against this file.
