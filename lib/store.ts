// Lokale Speicherung per IndexedDB (kostenlos, ohne Server).
const DB = "chemistry-explorer";
const STORE = "recent";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneed = () => req.result.createObjectStore(STORE, { keyPath: "query" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addRecent(query: string): Promise<void> {
  try {
    const db = await open();
    db.transaction(STORE, "readwrite").objectStore(STORE).put({ query, at: Date.now() });
  } catch { /* Speicherung ist optional */ }
}

export async function listRecent(limit = 8): Promise<string[]> {
  try {
    const db = await open();
    return await new Promise(resolve) => {
      const req = db.transaction(STORE).objectStore(STORE).getAll();
      req.onsuccess = () =>
        resolve((req.result as { query: string; at: number }[]).sort((a, b) => b.at - a.at).slice(0, limit).map((r) => r.query));
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
