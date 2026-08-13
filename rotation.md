<!-- This file is state, not just docs: Claude edits each category's "Recently
     used" line every time it starts a new list, and commits the change. Append
     new options to the end of a list freely; order doesn't matter (selection is
     random). -->

# Rotation staples

Every time Allyson **clears the previous list and starts a new list**, these
category batches are auto-added to `## To buy` in `list.md` (no confirmation
needed). Selection is **random with a cooldown** so we don't eat the same
bread/cheese/etc. week to week, but it's not a fixed sequence either.

## How to run it (for Claude)

When starting a new list, **after** archiving the old `## To buy` items, do this
for each category below:

1. Build a candidate pool = all its options **minus** every item in its
   **Recently used** line (that line already holds exactly the cooldown window,
   so exclude the whole line).
2. **Randomly pick** the category's per-list count from that pool. (If the pool
   somehow has fewer than the count, top up with the oldest recently-used items.)
3. File each pick onto `## To buy` under the **aisle** shown, deduped against the
   whole list. Add them as plain `- [ ] item` lines (no ` — note` tag).
4. **Update Recently used**: put this week's picks at the front (newest first),
   then trim the line back to its **cooldown** length (drop the oldest overflow).
5. Commit `rotation.md` together with `list.md`.

The cooldown is always ≥ the per-list count, so nothing repeats week-over-week;
it's wide enough to keep several recent weeks from coming back, yet leaves a
healthy pool to pick randomly from.

---

## Cheese — pick 2 per list · cooldown 4 → Dairy & eggs
- havarti
- mozzarella
- old cheddar
- brie
- feta
- goat
- gouda

**Recently used (newest first): havarti, mozzarella**

## Cereal — pick 2 per list · cooldown 4 → Pantry staples
- Cheerios
- Raisin Bran
- Cornflakes
- Mini Wheats
- Shreddies
- Shredded Wheat
- Weetabix
- All Bran

**Recently used (newest first): Cheerios, Raisin Bran**

## Crackers — pick 2 per list · cooldown 6 → Snacks
- Ryvita
- Triscuit
- Cranberry and Fennel Artisan Crisps
- Vinta Original
- rice crackers
- Aurora Bread Sticks Olive Oil
- Boulangerie Grissol Baguettes Olive Oil & Sea Salt
- soda crackers
- PC Black Pepper & Sea Salt Crackers
- Kellogg's Flatbread Sea Salt & Olive Oil
- Kellogg's Pita Everything Bagel

**Recently used (newest first): Ryvita, Triscuit**

## Breakfast breads — pick 2 per list · cooldown 2 → Bakery
- bagels
- crumpets
- english muffins
- raisin bread

**Recently used (newest first): bagels, crumpets**

## Breads — pick 3 per list · cooldown 4 → Bakery
- Country Harvest 14 Grain bread
- Ace Classic White Bistro
- Baguette
- Granary loaf sliced
- 12 grain bread sliced
- bakery Italian bread
- bakery Italian bread multi-grain sliced
- oat and honey whole wheat bread

**Recently used (newest first): Country Harvest 14 Grain bread, Ace Classic White Bistro, Baguette**

## Chocolate — pick 5 per list · cooldown 10 → Snacks (see aisle notes)
Most go to **Snacks**. Exceptions: **Ice Cream** and **Drumstick bites** →
Frozen foods; **chocolate chips** → Pantry staples (baking).
- Dairy Milk
- Drumstick bites
- chocolate chips
- Celebration butter cookies (milk chocolate)
- Lindt Swiss chocolate
- Lindt dark chocolate
- M&Ms
- chocolate covered pretzels
- Aero bar
- Cadbury 45 Candy
- Mini Eggs
- Puff cookies
- Oreos
- PC Chocolate chip cookies
- Fudgee-Os
- No Name Chocolatey Chip Cookies
- Ginger Snaps
- Biscoff Cookies
- Dare Ultimate Lemon Cream Cookies
- Ice Cream
- PC Mint Slamscuits
- No Name Fudge-striped shortbread cookies
- Wagon Wheels

**Recently used (newest first): Dairy Milk, Drumstick bites, chocolate chips, Celebration butter cookies (milk chocolate), Lindt Swiss chocolate**

## Juice — pick 2 per list · cooldown 4 → Beverages
- Bubbly carbonated water
- Fruit punch
- Lemonade
- Iced tea
- Apple juice
- orange juice
- Grape juice

**Recently used (newest first): Bubbly carbonated water, Fruit punch**
