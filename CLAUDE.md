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
  and the Instacart-in-Canada watch + check log.
- `staples.md` — recurring items to keep stocked.
