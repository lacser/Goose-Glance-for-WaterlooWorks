import { useEffect } from "react";

const DB_NAME = "gooseGlanceDB";
const DB_VERSION = 2;

// Per-job store
const JOB_STORE_NAME = "jobs";

export type JobRecord = {
  id: string;
  description?: string;
  summary?: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDBInternal(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB open error:", event);
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      // Create per-job store
      if (!db.objectStoreNames.contains(JOB_STORE_NAME)) {
        db.createObjectStore(JOB_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // In dev, if an old DB exists without the expected store, reset DB and recreate the store.
      if (!db.objectStoreNames.contains(JOB_STORE_NAME)) {
        try {
          db.close();
        } catch {
          // ignore: db may already be closed
        }
        const del = indexedDB.deleteDatabase(DB_NAME);
        del.onsuccess = () => {
          const req2 = indexedDB.open(DB_NAME, DB_VERSION);
          req2.onupgradeneeded = () => {
            const db2 = req2.result;
            if (!db2.objectStoreNames.contains(JOB_STORE_NAME)) {
              db2.createObjectStore(JOB_STORE_NAME, { keyPath: "id" });
            }
          };
          req2.onsuccess = () => resolve(req2.result);
          req2.onerror = (e) => {
            console.error("Re-open IndexedDB after delete failed:", e);
            // As a last resort, still resolve to the original db to avoid blocking
            resolve(db);
          };
        };
        del.onerror = (e) => {
          console.error("Delete IndexedDB failed:", e);
          resolve(db);
        };
        return;
      }
      resolve(db);
    };
  });
}

async function ensureDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = openDBInternal();
  }
  return dbPromise;
}

function broadcastUpdate(jobId: string, fields: Array<"description" | "summary">) {
  try {
    window.dispatchEvent(
      new CustomEvent("gg-db-updated", { detail: { jobId, fields } })
    );
  } catch {
    // ignore if CustomEvent is not available
  }
}

export async function getJob(jobId: string): Promise<JobRecord | null> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([JOB_STORE_NAME], "readonly");
    const store = tx.objectStore(JOB_STORE_NAME);
    const req = store.get(jobId);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = (e) => reject(e);
  });
}

export async function setJobDescription(jobId: string, description: string): Promise<void> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([JOB_STORE_NAME], "readwrite");
    const store = tx.objectStore(JOB_STORE_NAME);

    const getReq = store.get(jobId);
    getReq.onsuccess = () => {
      const prev = (getReq.result as JobRecord | undefined) ?? { id: jobId };
      const next: JobRecord = { ...prev, description };
      store.put(next);
    };
    getReq.onerror = (e) => reject(e);

    tx.oncomplete = () => {
      broadcastUpdate(jobId, ["description"]);
      resolve();
    };
    tx.onerror = (e) => reject(e);
    tx.onabort = (e) => reject(e);
  });
}

export async function setJobSummary(jobId: string, summary: string): Promise<void> {
  const db = await ensureDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([JOB_STORE_NAME], "readwrite");
    const store = tx.objectStore(JOB_STORE_NAME);

    const getReq = store.get(jobId);
    getReq.onsuccess = () => {
      const prev = (getReq.result as JobRecord | undefined) ?? { id: jobId };
      const next: JobRecord = { ...prev, summary };
      store.put(next);
    };
    getReq.onerror = (e) => reject(e);

    tx.oncomplete = () => {
      broadcastUpdate(jobId, ["summary"]);
      resolve();
    };
    tx.onerror = (e) => reject(e);
    tx.onabort = (e) => reject(e);
  });
}

export function subscribeJob(jobId: string, cb: () => void): () => void {
  const handler = (e: Event) => {
    const ce = e as CustomEvent;
    const detail = ce.detail as { jobId?: string; fields?: string[] } | undefined;
    if (detail && detail.jobId === jobId) {
      cb();
    }
  };
  window.addEventListener("gg-db-updated", handler as EventListener);
  return () => window.removeEventListener("gg-db-updated", handler as EventListener);
}

// Initialization hook to ensure DB is opened
export const useIndexedDB = () => {
  useEffect(() => {
    ensureDB();
  }, []);
};
