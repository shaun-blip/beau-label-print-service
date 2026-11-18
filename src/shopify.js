// Talks to the store through Shopify's Admin GraphQL API.
// NOTE: this file could not be run against a real store when it was written. Test it on a test order first.
const SHOP = process.env.SHOPIFY_SHOP;                    // e.g. beaubottles.myshopify.com
const VERSION = process.env.SHOPIFY_API_VERSION || "2026-07";
// Apps made in Shopify's Dev Dashboard (the only kind since January 2026) give a Client ID and Client secret.
// The service swaps those for an access token that lasts 24 hours and fetches a new one before it runs out.
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID, CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
// Older apps made in the store admin before 2026 have a permanent token instead. If one is set, it is used as is.
const STATIC_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

export const shopifyReady = () => Boolean(SHOP && (STATIC_TOKEN || (CLIENT_ID && CLIENT_SECRET)));

let cached = null, expiresAt = 0;
async function accessToken(force = false) {
  if (STATIC_TOKEN) return STATIC_TOKEN;
  if (!force && cached && Date.now() < expiresAt - 5 * 60 * 1000) return cached;
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET })
  });
  if (!res.ok) throw new Error("Shopify would not issue an access token (status " + res.status + "). Check the Client ID and secret, and that the app is installed on this store.");
  const json = await res.json();
  cached = json.access_token; expiresAt = Date.now() + (json.expires_in || 86399) * 1000;
  return cached;
}

async function gql(query, variables = {}, retry = true) {
  const res = await fetch(`https://${SHOP}/admin/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": await accessToken() },
    body: JSON.stringify({ query, variables })
  });
  if (res.status === 401 && retry && !STATIC_TOKEN) { await accessToken(true); return gql(query, variables, false); }   // token expired early: get a new one and try once more
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error("Shopify API error: " + JSON.stringify(json.errors || res.status));
  return json.data;
}
const userErrors = (payload, what) => {
  if (payload?.userErrors?.length) throw new Error(what + ": " + payload.userErrors.map(e => e.message).join("; "));
};

// Uploads a PDF to the store's Files and returns its public URL.
export async function uploadPdf(filename, buffer) {
  const staged = await gql(`mutation($input:[StagedUploadInput!]!){ stagedUploadsCreate(input:$input){
      stagedTargets{ url resourceUrl parameters{ name value } } userErrors{ field message } } }`,
    { input: [{ resource: "FILE", filename, mimeType: "application/pdf", httpMethod: "POST", fileSize: String(buffer.length) }] });
  userErrors(staged.stagedUploadsCreate, "Could not reserve the upload");
  const target = staged.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  target.parameters.forEach(p => form.append(p.name, p.value));
  form.append("file", new Blob([buffer], { type: "application/pdf" }), filename);
  const up = await fetch(target.url, { method: "POST", body: form });
  if (!up.ok) throw new Error("Upload failed with status " + up.status);

  const created = await gql(`mutation($files:[FileCreateInput!]!){ fileCreate(files:$files){
      files{ id fileStatus } userErrors{ field message } } }`,
    { files: [{ originalSource: target.resourceUrl, contentType: "FILE", alt: filename }] });
  userErrors(created.fileCreate, "Could not register the file");
  const id = created.fileCreate.files[0].id;

  // Shopify processes files in the background. Wait until the link is ready.
  for (let i = 0; i < 20; i++) {
    const data = await gql(`query($id:ID!){ node(id:$id){ ... on GenericFile { fileStatus url } } }`, { id });
    if (data.node?.fileStatus === "READY" && data.node.url) return data.node.url;
    if (data.node?.fileStatus === "FAILED") throw new Error("Shopify could not process the PDF.");
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error("The PDF was uploaded but its link was not ready in time.");
}

// Puts the print files on the order: a metafield staff can click, a tag for filtering, and a line in the order note.
// The three writes are tried independently, so one failing never hides the others; errors are reported together.
export async function attachToOrder(orderGid, files, existingNote = "") {
  const lines = files.map(f => `Label print file (${f.title}): ${f.url}  |  print ${f.copies} cop${f.copies === 1 ? "y" : "ies"} of ${f.pages} page${f.pages === 1 ? "" : "s"}`);
  const problems = [];
  const attempt = async (what, fn) => { try { await fn(); } catch (e) { problems.push(what + ": " + e.message); } };
  await attempt("metafield", async () => {
    const set = await gql(`mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ field message } } }`,
      { m: [{ ownerId: orderGid, namespace: "custom_labels", key: "print_files", type: "json", value: JSON.stringify(files) }] });
    userErrors(set.metafieldsSet, "Could not save the print file link on the order");
  });
  await attempt("tag", async () => {
    const tag = await gql(`mutation($id:ID!,$tags:[String!]!){ tagsAdd(id:$id,tags:$tags){ userErrors{ field message } } }`,
      { id: orderGid, tags: ["labels-ready"] });
    userErrors(tag.tagsAdd, "Could not tag the order");
  });
  await attempt("note", async () => {
    const note = [existingNote, ...lines].filter(Boolean).join("\n");
    const upd = await gql(`mutation($input:OrderInput!){ orderUpdate(input:$input){ userErrors{ field message } } }`,
      { input: { id: orderGid, note } });
    userErrors(upd.orderUpdate, "Could not update the order note");
  });
  if (problems.length) throw new Error(problems.join("; "));
}

export async function flagOrder(orderGid, message, existingNote = "") {
  // Tag first: the tag is how staff find problem orders, so it must land even if the note cannot.
  await gql(`mutation($id:ID!,$tags:[String!]!){ tagsAdd(id:$id,tags:$tags){ userErrors{ field message } } }`, { id: orderGid, tags: ["labels-problem"] });
  const upd = await gql(`mutation($input:OrderInput!){ orderUpdate(input:$input){ userErrors{ field message } } }`,
    { input: { id: orderGid, note: [existingNote, "LABEL PRINT FILE PROBLEM: " + message].filter(Boolean).join("\n") } });
  userErrors(upd.orderUpdate, "Could not update the order note");
}

// Who am I? The installed app this service's token belongs to, and the scopes that token carries.
export async function appInfo() {
  const d = await gql(`{ currentAppInstallation { accessScopes { handle } app { title apiKey } } }`);
  const i = d.currentAppInstallation;
  return { app: i?.app?.title, clientId: i?.app?.apiKey, scopes: (i?.accessScopes || []).map(s => s.handle) };
}
