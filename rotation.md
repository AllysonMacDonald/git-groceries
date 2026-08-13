<!-- This file is state, not just docs: Claude edits the "Next up" cursors each
     time it starts a new list, and commits the change. Do not hand-reorder the
     option lists (it would desync the cursors) — append new options at the end. -->

# Rotation staples

Every time Allyson **clears the previous list and starts a new list**, these
category batches are auto-added to `## To buy` in `list.md` (no confirmation
needed). We rotate so we don't eat the same bread/cheese/etc. every week.

## How to run it (for Claude)

When starting a new list, **after** archiving the old `## To buy` items to
`## Ordered / done`, do this for each category below:

1. Read its **Next up** number `N` and its **per-list count** `C`.
2. Take `C` items starting at position `N`, **wrapping** past the end back to #1
   (e.g. count 3 on an 8-item list at position 7 → items 7, 8, 1).
3. File each onto `## To buy` under the **aisle** shown, deduped against the whole
   list. Add them as plain `- [ ] item` lines (no ` — note` tag).
4. Set **Next up** to `((N − 1 + C) mod list-length) + 1` — i.e. the item right
   after the last one you took — so next week continues the cycle.
5. Commit `rotation.md` together with `list.md`.

This walks each list top-to-bottom, `C` at a time, before any repeat — a true
rotation, not random. To add a new option, append it to the **end** of a list
(don't renumber) so the cursor stays valid.

---

## Cheese — 2 per list → Dairy & eggs
1. havarti
2. mozzarella
3. old cheddar
4. brie
5. feta
6. goat
7. gouda

**Next up: 1** (havarti)

## Cereal — 2 per list → Pantry staples
1. Cheerios
2. Raisin Bran
3. Cornflakes
4. Mini Wheats
5. Shreddies
6. Shredded Wheat
7. Weetabix
8. All Bran

**Next up: 1** (Cheerios)

## Crackers — 2 per list → Snacks
1. Ryvita
2. Triscuit
3. Cranberry and Fennel Artisan Crisps
4. Vinta Original
5. rice crackers
6. Aurora Bread Sticks Olive Oil
7. Boulangerie Grissol Baguettes Olive Oil & Sea Salt
8. soda crackers
9. PC Black Pepper & Sea Salt Crackers
10. Kellogg's Flatbread Sea Salt & Olive Oil
11. Kellogg's Pita Everything Bagel

**Next up: 1** (Ryvita)

## Breakfast breads — 2 per list → Bakery
1. bagels
2. crumpets
3. english muffins
4. raisin bread

**Next up: 1** (bagels)

## Breads — 3 per list → Bakery
1. Country Harvest 14 Grain Bread
2. Ace Classic White Bistro
3. Baguette
4. Granary loaf sliced
5. 12 grain bread sliced
6. bakery Italian bread
7. bakery Italian bread multi-grain sliced
8. oat and honey whole wheat bread

**Next up: 1** (Country Harvest 14 Grain Bread)

## Chocolate — 5 per list → Snacks (see aisle notes)
Most go to **Snacks**. Exceptions: **Ice Cream** and **Drumstick bites** →
Frozen foods; **chocolate chips** → Pantry staples (baking).
1. Dairy Milk
2. Drumstick bites
3. chocolate chips
4. Celebration butter cookies milk chocolate
5. Lindt Swiss Chocolate
6. Lindt dark Chocolate
7. M&Ms
8. chocolate covered pretzels
9. Aero bar
10. Cadbury 45 Candy
11. Mini Eggs
12. Puff cookies
13. Oreos
14. PC Chocolate chip cookies
15. Fudgee-Os
16. No Name Chocolatey Chip Cookies
17. Ginger Snaps
18. Biscoff Cookies
19. Dare Ultimate Lemon Cream Cookies
20. Ice Cream
21. PC Mint Slamscuits
22. No Name Fudge-striped shortbread cookies
23. Wagon Wheels

**Next up: 1** (Dairy Milk)

## Juice — 2 per list → Beverages
1. Bubbly carbonated water
2. Fruit punch
3. Lemonade
4. Iced tea
5. Apple juice
6. orange juice
7. Grape juice

**Next up: 1** (Bubbly carbonated water)
