// Where saved designs live. This version keeps one JSON file per design in DATA_DIR.
// On Render, attach a persistent disk and point DATA_DIR at it, or designs are lost on each deploy.
// To move to a database later, keep these same four functions.
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DIR = process.env.DATA_DIR || path.resolve("data");
const file = id => path.join(DIR, id.replace(/[^a-zA-Z0-9_-]/g, "") + ".json");

export async function saveDesign(design) {
  await fs.mkdir(DIR, { recursive: true });
  const id = "d_" + crypto.randomBytes(9).toString("base64url");
  await fs.writeFile(file(id), JSON.stringify({ id, savedAt: new Date().toISOString(), design }));
  return id;
}
export async function loadDesign(id) {
  try { return JSON.parse(await fs.readFile(file(id), "utf8")).design; } catch { return null; }
}
// Rescue hatch: corrects a stored design IN PLACE (same id), so the order that points at it
// re-renders fixed. Only /designs/:id.json POST uses it, on an existing design.
export async function overwriteDesign(id, design) {
  await fs.writeFile(file(id), JSON.stringify({ id, savedAt: new Date().toISOString(), design }));
}
// Remembers which order lines are already done, so a repeated Shopify notification does not print twice.
export async function markDone(key, value) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file("done_" + key), JSON.stringify({ design: value, at: new Date().toISOString() }));
}
export async function clearDone(key) {
  try { await fs.unlink(file("done_" + key)); return true; } catch { return false; }
}
export async function isDone(key) {
  try { return JSON.parse(await fs.readFile(file("done_" + key), "utf8")).design; } catch { return null; }
}
// An order notice is written to disk BEFORE it is acknowledged to Shopify, and cleared once its
// work finishes. Shopify never retries an acknowledged notice, so if the instance dies mid-render
// (it is small, and photos are heavy), the saved notice is what lets the next boot finish the job.
export async function saveTodo(key, payload) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file("todo_" + key), JSON.stringify(payload));
}
export async function clearTodo(key) {
  try { await fs.unlink(file("todo_" + key)); } catch {}
}
export async function listTodos() {
  try {
    const out = [];
    for (const n of await fs.readdir(DIR)) if (n.startsWith("todo_")) {
      try { out.push(JSON.parse(await fs.readFile(path.join(DIR, n), "utf8"))); } catch {}
    }
    return out;
  } catch { return []; }
}
// Single labels wait here until they are printed together on shared sheets (see /batch).
const QUEUE = () => path.join(DIR, "singles-queue.json");
async function readQueue() { try { return JSON.parse(await fs.readFile(QUEUE(), "utf8")); } catch { return []; } }
export async function queueSingle(entry) {
  await fs.mkdir(DIR, { recursive: true });
  const q = await readQueue();
  if (!q.some(e => e.key === entry.key)) { q.push({ ...entry, at: new Date().toISOString() }); await fs.writeFile(QUEUE(), JSON.stringify(q)); }
}
export async function listSingles(size) { const q = await readQueue(); return size ? q.filter(e => e.size === size) : q; }
// Every removal from the singles queue is logged — "printed" when the Printed button clears a
// batch, "manual" when staff remove chosen lines — so a mistaken removal can be seen on /batch
// and restored. The log keeps the last 500 removals.
const REMOVED = () => path.join(DIR, "singles-removed.json");
async function readRemoved() { try { return JSON.parse(await fs.readFile(REMOVED(), "utf8")); } catch { return []; } }
async function logRemoved(entries, how) {
  if (!entries.length) return;
  const log = await readRemoved(), at = new Date().toISOString();
  for (const e of entries) log.unshift({ ...e, removedAt: at, how });
  await fs.writeFile(REMOVED(), JSON.stringify(log.slice(0, 500)));
}
export async function listRemoved(limit = 20) { return (await readRemoved()).slice(0, limit); }
// Removes chosen order lines by key, wherever they sit in the queue.
export async function removeSingles(keys) {
  const q = await readQueue(), gone = q.filter(e => keys.includes(e.key)), keep = q.filter(e => !keys.includes(e.key));
  await fs.writeFile(QUEUE(), JSON.stringify(keep));
  await logRemoved(gone, "manual");
  return gone.length;
}
// Puts one removed line back in the queue. Queued with a fresh timestamp, so a later
// "Printed: clear these" (which clears up to a moment in time) cannot sweep it by accident.
export async function restoreSingle(key) {
  const log = await readRemoved(), e = log.find(x => x.key === key && !x.restoredAt);
  if (!e) return false;
  const { removedAt, how, restoredAt, ...entry } = e;
  await queueSingle({ ...entry, at: new Date().toISOString() });
  e.restoredAt = new Date().toISOString();
  await fs.writeFile(REMOVED(), JSON.stringify(log));
  return true;
}
// Removes the entries for one bottle size that were queued up to a moment in time: the ones on the sheets just printed.
export async function clearSingles(size, upto) {
  const q = await readQueue(), keep = q.filter(e => e.size !== size || e.at > upto);
  await fs.writeFile(QUEUE(), JSON.stringify(keep));
  await logRemoved(q.filter(e => e.size === size && e.at <= upto), "printed");
  return q.length - keep.length;
}
// The finished order lines, newest first — what /reprint lists.
export async function listDone(limit = 25) {
  const names = (await fs.readdir(DIR).catch(() => [])).filter(n => n.startsWith("done_"));
  const out = [];
  for (const n of names) {
    try {
      const s = await fs.stat(path.join(DIR, n));
      const j = JSON.parse(await fs.readFile(path.join(DIR, n), "utf8"));
      out.push({ key: n.slice(5, -5), designId: j.design, at: j.at || s.mtime.toISOString() });
    } catch {}
  }
  return out.sort((a, b) => (b.at || "").localeCompare(a.at || "")).slice(0, limit);
}
// What the disk knows, for remote diagnosis: which notices arrived, which lines finished, when.
export async function debugState() {
  const names = await fs.readdir(DIR).catch(() => []);
  const stat = async n => { try { const s = await fs.stat(path.join(DIR, n)); return { file: n, at: s.mtime.toISOString(), bytes: s.size }; } catch { return { file: n }; } };
  const of = async p => (await Promise.all(names.filter(n => n.startsWith(p)).map(stat))).sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  return { todos: await of("todo_"), done: (await of("done_")).slice(0, 25), designCount: names.filter(n => n.startsWith("d_")).length, newestDesigns: (await of("d_")).slice(0, 5) };
}
