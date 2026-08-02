# git-groceries — instructions for Claude

This repo is Allyson's shared grocery system. `list.md` is the single source of
truth; `index.html` publishes it via GitHub Pages at
https://allysonmacdonald.github.io/git-groceries/ for both partners' phones
(read-only, auto-refresh ~20s). All changes go through Claude editing `list.md`.

## When Allyson says "add X to the list" / "we're out of X" / "put X on the list"

Do this, no confirmation needed:
1. **File each item** under `## To buy` in `list.md`, in the **right category**
   (the 12 aisle buckets — see `README.md`). Create the `###` heading if missing;
   keep headings in the documented order. An item is a `- [ ] item` line; you may
   add ` — note` (e.g. `- [ ] celery — chowder`).
2. **Deduplicate** against everything already on the list (any category).
3. **Commit, then push** — `git push origin main` works directly here (a stored
   token; see below). Do not wait for the user to push.
4. **Confirm in one line**, naming the category each item went to.

"add <Recipe> to the list" → drop that recipe's whole ingredient list from
`recipes.md` onto `## To buy`, each ingredient filed to its category, deduped.

## The `### Uncategorized items` bucket (items added from a phone)

The live page has an "Add item" box. When a partner adds something from their
phone, the Netlify function classifies it and files it under the right category
in `## To buy` (deduped) — no Claude in the loop at that moment. Only items the
classifier can't place confidently land under `### Uncategorized items` (the
last category in `## To buy`).

**At the start of any interaction with this repo, and whenever you touch
`list.md`:** if `### Uncategorized items` has any items, re-file each one into
the right category under `## To buy` (deduping against the whole list), remove
it from `### Uncategorized items`, then commit and push. Treat it exactly like
an "add X to the list" request. Leave the `### Uncategorized items` heading and
its comment in place — just empty.

## Weekly meal planner (Mondays 9am Atlantic — auto)

A scheduled cloud agent runs this every Monday. Any Claude can run it too if
asked ("plan this week's meals"). Steps:

1. **Read** `preferences.md` (the family taste profile), `recipes.md` (the
   collection), `meal-plans.md` (recent weeks — to avoid repeats), and `list.md`.
2. **Pick 6 dinners** for the week: **2 vegetarian (lacto-ovo) · 2 simple
   meat-and-veg · 2 kid-friendly** (one no-heat for the 8-year-old, one
   stovetop/oven for the 12-year-old). Keep them **~30 min and mild**; **vary
   cuisines and proteins** across the six; **don't repeat** anything from the
   last ~3–4 weeks in `meal-plans.md`.
3. **Source — about half new, half favorites:** each week source roughly **3
   new** recipes from outside `recipes.md` (your culinary knowledge and the web)
   and reuse roughly **3** from the existing collection (respecting the no-repeat
   rule). Write every new recipe into `recipes.md` in the standard format — a
   `##` title, a `*summary*` line, a `<!-- tags: short-nickname -->` line,
   `### Ingredients` (`- [ ]` lines), `### Method`, and `**Notes:**`. If you adapt
   one you found online, rewrite it in your own words (don't paste verbatim).
4. **Add to the list (auto, no approval):** file every ingredient onto `## To
   buy` in the right aisle, deduped against the whole list, each tagged with its
   recipe's nickname as the ` — note` (e.g. `- [ ] baby potatoes — sheet-pan
   chicken`). Merge the tag into an existing item's note rather than duplicating.
   Skip basics like salt, pepper, and water.
5. **Log it:** prepend the week's six to `meal-plans.md` (see its format).
6. **Commit and push** to `main`. Also re-file `### Uncategorized items` if any.

The six then appear on the page automatically (the page shows recipes whose
ingredients are on the list). See `how-it-works.md` → "Weekly meal planning".

## Pushing

Direct push is set up: HTTPS with a fine-grained PAT stored in
`~/.git-credentials`. SSH is blocked in this environment — use HTTPS. If a push
fails with an auth error, the token was likely revoked; ask Allyson for a fresh
fine-grained token (repo: git-groceries, Contents: read/write).

## Verify, don't assume

After pushing, confirm it's actually live before saying it's done:
`curl -s https://allysonmacdonald.github.io/git-groceries/list.md`. GitHub Pages
takes ~1–2 min to rebuild. State facts only after checking.

## More detail

- `README.md` — capture protocol + the 12 categories (aisle order + judgment notes).
- `how-it-works.md` — weekly PC Express ordering cadence, staples nudge, recipes,
  meal planning, and the Instacart-in-Canada watch + check log.
- `preferences.md` — the family food profile the weekly planner reads.
- `recipes.md` — saved recipes (each with a `<!-- tags: … -->` nickname).
- `meal-plans.md` — the weekly planner's history log (avoid recent repeats).
- `staples.md` — recurring items to keep stocked.
