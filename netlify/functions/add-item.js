// Netlify Function: file a phone-added grocery item into list.md via the GitHub
// Contents API. The item is classified into one of the 12 aisle categories and
// inserted under that "### heading" in "## To buy". Anything the classifier
// can't place confidently falls back to "## Inbox" for Claude to file by
// judgment on the next interaction. The live page shows the change on its next
// poll (~20s).
//
// Required env var (set in Netlify dashboard → Site settings → Environment):
//   GITHUB_TOKEN  — fine-grained PAT, repo git-groceries, Contents: read/write
// Optional env vars (sensible defaults below):
//   GH_OWNER (allysonmacdonald), GH_REPO (git-groceries),
//   GH_BRANCH (main), GH_PATH (list.md)
//   ADD_SECRET — if set, requests must send header  x-add-secret: <value>.

const OWNER = process.env.GH_OWNER || "allysonmacdonald";
const REPO = process.env.GH_REPO || "git-groceries";
const BRANCH = process.env.GH_BRANCH || "main";
const PATH = process.env.GH_PATH || "list.md";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;

const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "git-groceries-add-item",
  "X-GitHub-Api-Version": "2022-11-28",
};

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

// Turn free text into a single safe list item. Strips any checkbox/bullet the
// user may have pasted, collapses whitespace/newlines, caps length.
function cleanItem(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/^[-*]\s*\[[ xX]?\]\s*/, "") // strip "- [ ] " if pasted
    .replace(/^[-*]\s+/, "") // strip a leading bullet
    .trim()
    .slice(0, 200);
}

// ---------------------------------------------------------------------------
// Classification: match an item to one of the 12 aisle categories (README's
// documented buckets). Keyword lists are matched as whole words against the
// lowercased item text. Returns the exact "### heading" text, or null when
// nothing matches (→ caller drops it in the Inbox for Claude to file).
// ---------------------------------------------------------------------------

// Checked first, in order — these win over the keyword table below to resolve
// items that would otherwise land in the wrong aisle (e.g. "frozen peas" is
// produce by keyword but belongs in Frozen; "almond milk" is a beverage, not
// dairy; "chicken broth" is a pantry item, not meat).
const OVERRIDES = [
  [/\bfrozen\b|\bice cream\b|\bpopsicle(s)?\b|\bfreezer\b/, "Frozen foods"],
  [/\b(almond|oat|soy|soya|cashew|rice|coconut)\s*milk\b/, "Beverages"],
  [/\b(broth|stock|bouillon|gravy)\b/, "Pantry staples"],
  // Compound items whose first word is produce but which belong elsewhere.
  [/\bjuice\b/, "Beverages"],
  [/\bchips\b/, "Snacks"],
];

// Category → whole-word keywords. Order matters: the first category with a hit
// wins, so more specific aisles are listed before broad ones.
const CATEGORIES = [
  ["Meat, poultry & seafood", [
    "chicken", "beef", "pork", "steak", "steaks", "turkey", "ham", "bacon",
    "sausage", "sausages", "chop", "chops", "ribs", "lamb", "veal", "meatballs",
    "ground beef", "ground turkey", "ground chicken", "ground pork", "mince",
    "deli", "salami", "pepperoni", "prosciutto", "wings", "drumsticks", "thighs",
    "fish", "cod", "haddock", "salmon", "tuna", "tilapia", "trout", "shrimp",
    "prawns", "scallop", "scallops", "crab", "lobster", "mussels", "clams",
  ]],
  ["Dairy & eggs", [
    "milk", "egg", "eggs", "butter", "cream", "cheese", "cheddar", "mozzarella",
    "parmesan", "parmigiano", "feta", "yogurt", "yoghurt", "brie", "gouda",
    "sour cream", "cottage cheese", "cream cheese", "whipping cream",
    "heavy cream", "half and half", "buttermilk", "margarine",
  ]],
  ["Bakery", [
    "bread", "bun", "buns", "bagel", "bagels", "tortilla", "tortillas", "pita",
    "naan", "croissant", "croissants", "muffin", "muffins", "cake", "roll",
    "rolls", "baguette", "loaf", "donut", "donuts", "doughnut", "pastry",
    "danish", "brioche",
  ]],
  ["Fruit & vegetables", [
    "apple", "apples", "banana", "bananas", "orange", "oranges", "lemon",
    "lemons", "lime", "limes", "grape", "grapes", "berry", "berries",
    "strawberries", "strawberry", "blueberries", "raspberries", "blackberries",
    "melon", "watermelon", "cantaloupe", "pineapple", "mango", "mangoes",
    "peach", "peaches", "pear", "pears", "plum", "plums", "kiwi", "cherry",
    "cherries", "avocado", "avocados", "tomato", "tomatoes", "potato",
    "potatoes", "onion", "onions", "garlic", "ginger", "carrot", "carrots",
    "celery", "cucumber", "cucumbers", "lettuce", "spinach", "kale", "arugula",
    "cabbage", "broccoli", "cauliflower", "bell pepper", "bell peppers",
    "mushroom", "mushrooms", "zucchini", "squash", "corn", "peas",
    "green beans", "asparagus", "eggplant", "radish", "beet", "beets", "leek",
    "leeks", "scallion", "scallions", "green onion", "green onions", "parsley",
    "cilantro", "basil", "thyme", "rosemary", "mint", "dill", "salad",
    "sprouts", "brussels", "grapefruit", "clementines", "berries",
  ]],
  ["Pantry staples", [
    "pasta", "spaghetti", "rotini", "fusilli", "penne", "macaroni", "noodle",
    "noodles", "rice", "flour", "sugar", "salt", "oil", "olive oil",
    "vegetable oil", "vinegar", "ketchup", "mustard", "mayo", "mayonnaise",
    "soy sauce", "sauce", "salsa", "honey", "syrup", "jam", "jelly",
    "peanut butter", "nutella", "cereal", "oats", "oatmeal", "granola",
    "lentils", "chickpeas", "beans", "quinoa", "couscous", "barley",
    "soup", "paste", "spice", "spices",
    "oregano", "cumin", "paprika", "cinnamon", "nutmeg", "curry", "seasoning",
    "baking soda", "baking powder", "yeast", "cornstarch", "breadcrumbs",
    "olives", "pickles", "vanilla", "cocoa", "raisins", "bay leaf",
    "coconut milk", "canned tomatoes", "tomato paste", "stock cube",
  ]],
  ["Beverages", [
    "coffee", "tea", "juice", "pop", "soda", "cola", "water",
    "sparkling water", "lemonade", "gatorade", "kombucha", "coconut water",
    "energy drink", "smoothie",
  ]],
  ["Snacks", [
    "chips", "crackers", "cookies", "cookie", "candy", "chocolate", "granola bar",
    "granola bars", "nuts", "almonds", "cashews", "peanuts", "pretzels",
    "popcorn", "snack", "snacks", "gum", "jerky", "trail mix", "wafers",
  ]],
  ["Cleaning products", [
    "dish soap", "detergent", "bleach", "cleaner", "all-purpose", "windex",
    "lysol", "disinfectant", "fabric softener", "dishwasher", "dishwashing",
    "degreaser", "comet",
  ]],
  ["Household supplies", [
    "paper towel", "paper towels", "toilet paper", "tissue", "tissues",
    "kleenex", "foil", "aluminum foil", "plastic wrap", "saran wrap", "ziploc",
    "garbage bags", "trash bags", "napkins", "batteries", "battery",
    "light bulb", "light bulbs", "bulb", "matches", "candles", "paper plates",
    "paper cups", "straws", "sponge", "sponges",
  ]],
  ["Personal care", [
    "toothpaste", "toothbrush", "shampoo", "conditioner", "deodorant", "soap",
    "body wash", "lotion", "razor", "razors", "shaving cream", "floss",
    "mouthwash", "tampons", "pads", "cotton swabs", "q-tips", "band-aid",
    "bandages", "medicine", "tylenol", "advil", "ibuprofen", "aspirin",
    "cough syrup", "sunscreen", "makeup", "lip balm", "chapstick",
    "moisturizer", "hand sanitizer", "nail",
  ]],
  ["Specialty or dietary items", [
    "tofu", "tempeh", "seitan", "vegan", "gluten-free", "gluten free",
    "protein powder", "supplement", "supplements", "vitamins", "vitamin",
    "baby food", "diapers", "formula", "dog food", "cat food", "pet food",
  ]],
];

// Build a matcher: escape regex specials, match as a whole "word" allowing the
// keyword to sit at a word boundary (handles multi-word keywords too).
function matchesKeyword(text, kw) {
  const esc = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i").test(text);
}

// Return the "### heading" an item belongs under, or null if unclassifiable.
function categorize(item) {
  const text = ` ${item.toLowerCase()} `;
  for (const [re, cat] of OVERRIDES) {
    if (re.test(text)) return cat;
  }
  for (const [cat, keywords] of CATEGORIES) {
    if (keywords.some((kw) => matchesKeyword(text, kw))) return cat;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Insertion
// ---------------------------------------------------------------------------

// Insert "- [ ] <item>" under the given "### <category>" heading inside
// "## To buy". If the category can't be found, or `category` is null, insert
// under "## Inbox" instead (creating it above "## To buy" if missing).
// Returns { md, section } on success, or null when the item is a duplicate.
function addItem(md, item, category) {
  const line = `- [ ] ${item}`;

  // Duplicate guard: same item text already present anywhere (case-insensitive).
  const existing = md.match(/^\s*[-*]\s+\[[ xX]?\]\s+(.+?)\s*$/gm) || [];
  const norm = (s) => s.replace(/^\s*[-*]\s+\[[ xX]?\]\s+/, "").trim().toLowerCase();
  if (existing.some((l) => norm(l) === item.toLowerCase())) return null;

  const lines = md.split(/\r?\n/);

  // Try to place under the "### <category>" heading (must be within "## To buy").
  if (category) {
    const headingIdx = lines.findIndex((l) =>
      new RegExp(`^###\\s+${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i").test(l)
    );
    if (headingIdx !== -1) {
      // Section runs until the next "### " or "## " heading (or EOF).
      let end = lines.length;
      for (let i = headingIdx + 1; i < lines.length; i++) {
        if (/^#{2,3}\s+/.test(lines[i])) { end = i; break; }
      }
      // Insert after the last existing item / non-blank line in the section.
      let insertAt = end;
      while (insertAt > headingIdx + 1 && lines[insertAt - 1].trim() === "") insertAt--;
      lines.splice(insertAt, 0, line);
      return { md: lines.join("\n"), section: category };
    }
  }

  // Fallback: the Inbox.
  const inboxIdx = lines.findIndex((l) => /^##\s+inbox\s*$/i.test(l));
  if (inboxIdx !== -1) {
    let end = lines.length;
    for (let i = inboxIdx + 1; i < lines.length; i++) {
      if (/^##\s+/.test(lines[i])) { end = i; break; }
    }
    let insertAt = end;
    while (insertAt > inboxIdx + 1 && lines[insertAt - 1].trim() === "") insertAt--;
    lines.splice(insertAt, 0, line);
    return { md: lines.join("\n"), section: "Inbox" };
  }

  // No Inbox heading either: create one just above "## To buy" (or at the top).
  const buyIdx = lines.findIndex((l) => /^##\s+to buy\s*$/i.test(l));
  const block = ["## Inbox", "", line, ""];
  if (buyIdx !== -1) lines.splice(buyIdx, 0, ...block);
  else lines.unshift(...block, "");
  return { md: lines.join("\n"), section: "Inbox" };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Use POST." });
  if (!process.env.GITHUB_TOKEN) return json(500, { error: "Server not configured (no token)." });

  if (process.env.ADD_SECRET) {
    const sent = event.headers["x-add-secret"] || event.headers["X-Add-Secret"];
    if (sent !== process.env.ADD_SECRET) return json(401, { error: "Not authorized." });
  }

  let item;
  try {
    item = cleanItem(JSON.parse(event.body || "{}").item);
  } catch (e) {
    return json(400, { error: "Bad request." });
  }
  if (!item) return json(400, { error: "Type something to add." });

  const category = categorize(item);

  // Retry loop to survive the occasional concurrent-edit SHA conflict (409).
  for (let attempt = 0; attempt < 3; attempt++) {
    const getRes = await fetch(`${API}?ref=${BRANCH}&t=${Date.now()}`, { headers: HEADERS });
    if (!getRes.ok) return json(502, { error: `Couldn't read list (${getRes.status}).` });
    const file = await getRes.json();
    const current = Buffer.from(file.content, "base64").toString("utf8");

    const result = addItem(current, item, category);
    if (result === null) return json(200, { ok: true, duplicate: true, item });

    const putRes = await fetch(API, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({
        message: `Add "${item}" from phone → ${result.section}`,
        content: Buffer.from(result.md, "utf8").toString("base64"),
        sha: file.sha,
        branch: BRANCH,
      }),
    });
    if (putRes.ok) return json(200, { ok: true, item, section: result.section });
    if (putRes.status !== 409) {
      return json(502, { error: `Couldn't save (${putRes.status}).` });
    }
    // 409 → someone else committed; loop and retry with a fresh SHA.
  }
  return json(409, { error: "List was busy, please try again." });
};
