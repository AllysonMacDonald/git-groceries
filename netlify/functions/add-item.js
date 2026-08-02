// Netlify Function: append a phone-added grocery item to list.md's "## Inbox"
// section via the GitHub Contents API. The live page then shows it on its next
// poll, and Claude re-files it into the right category on the next interaction.
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

// Insert "- [ ] <item>" under the "## Inbox" heading, creating the section right
// above "## To buy" if it's somehow missing. Returns null if it's a duplicate.
function addToInbox(md, item) {
  const line = `- [ ] ${item}`;

  // Duplicate guard: same item text already present anywhere (case-insensitive).
  const existing = md.match(/^\s*[-*]\s+\[[ xX]?\]\s+(.+?)\s*$/gm) || [];
  const norm = (s) => s.replace(/^\s*[-*]\s+\[[ xX]?\]\s+/, "").trim().toLowerCase();
  if (existing.some((l) => norm(l) === item.toLowerCase())) return null;

  const lines = md.split(/\r?\n/);
  const inboxIdx = lines.findIndex((l) => /^##\s+inbox\s*$/i.test(l));

  if (inboxIdx !== -1) {
    // Find the end of the Inbox section (next "## " heading or EOF), then insert
    // the item as the last non-blank line before that boundary.
    let end = lines.length;
    for (let i = inboxIdx + 1; i < lines.length; i++) {
      if (/^##\s+/.test(lines[i])) { end = i; break; }
    }
    let insertAt = end;
    while (insertAt > inboxIdx + 1 && lines[insertAt - 1].trim() === "") insertAt--;
    lines.splice(insertAt, 0, line);
    return lines.join("\n");
  }

  // No Inbox heading: create one just above "## To buy" (or at the top).
  const buyIdx = lines.findIndex((l) => /^##\s+to buy\s*$/i.test(l));
  const block = ["## Inbox", "", line, ""];
  if (buyIdx !== -1) {
    lines.splice(buyIdx, 0, ...block);
  } else {
    lines.unshift(...block, "");
  }
  return lines.join("\n");
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

  // Retry loop to survive the occasional concurrent-edit SHA conflict (409).
  for (let attempt = 0; attempt < 3; attempt++) {
    const getRes = await fetch(`${API}?ref=${BRANCH}&t=${Date.now()}`, { headers: HEADERS });
    if (!getRes.ok) return json(502, { error: `Couldn't read list (${getRes.status}).` });
    const file = await getRes.json();
    const current = Buffer.from(file.content, "base64").toString("utf8");

    const updated = addToInbox(current, item);
    if (updated === null) return json(200, { ok: true, duplicate: true, item });

    const putRes = await fetch(API, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({
        message: `Add "${item}" from phone`,
        content: Buffer.from(updated, "utf8").toString("base64"),
        sha: file.sha,
        branch: BRANCH,
      }),
    });
    if (putRes.ok) return json(200, { ok: true, item });
    if (putRes.status !== 409) {
      return json(502, { error: `Couldn't save (${putRes.status}).` });
    }
    // 409 → someone else committed; loop and retry with a fresh SHA.
  }
  return json(409, { error: "List was busy, please try again." });
};
