type ForgeTask = {
  id: string;
  title: string;
  kind: string;
  status: string;
  createdAt: string;
};

const fallbackTasks: ForgeTask[] = [
  { id: "seed-1", title: "Forge workspace initialized", kind: "system", status: "ready", createdAt: new Date().toISOString() },
];

function config() {
  return {
    url: process.env.SUPABASE_URL?.replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  };
}

export async function listForgeTasks(limit = 8): Promise<ForgeTask[]> {
  const { url, key } = config();
  if (!url || !key) return fallbackTasks.slice(0, limit);
  const response = await fetch(`${url}/rest/v1/forge_tasks?select=id,title,kind,status,created_at&order=created_at.desc&limit=${limit}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Supabase task query failed (${response.status})`);
  const rows = await response.json() as Array<{ id: string; title: string; kind: string; status: string; created_at: string }>;
  return rows.map((row) => ({ id: row.id, title: row.title, kind: row.kind, status: row.status, createdAt: row.created_at }));
}

export async function createForgeTask(input: { title: string; kind?: string }): Promise<ForgeTask> {
  const now = new Date().toISOString();
  const localTask: ForgeTask = { id: `local-${Date.now()}`, title: input.title, kind: input.kind || "task", status: "queued", createdAt: now };
  const { url, key } = config();
  if (!url || !key) {
    fallbackTasks.unshift(localTask);
    return localTask;
  }
  const response = await fetch(`${url}/rest/v1/forge_tasks`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ title: input.title, kind: input.kind || "task", status: "queued" }),
  });
  if (!response.ok) throw new Error(`Supabase task insert failed (${response.status})`);
  const [row] = await response.json() as Array<{ id: string; title: string; kind: string; status: string; created_at: string }>;
  return { id: row.id, title: row.title, kind: row.kind, status: row.status, createdAt: row.created_at };
}

export const supabaseConfigured = () => Boolean(config().url && config().key);
