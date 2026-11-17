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
// Remembers which order lines are already done, so a repeated Shopify notification does not print twice.
export async function markDone(key, value) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(file("done_" + key), JSON.stringify({ design: value, at: new Date().toISOString() }));
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
