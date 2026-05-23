/**
 * IndexedDB blob store for attachment data that is too large for localStorage.
 *
 * Attachment blobs are keyed by their Attachment.id so they survive Redux
 * rehydration and can be loaded on demand by any component that needs to
 * display a local (offline) attachment.
 */
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "billvault";
const STORE_BLOBS = "attachment_blobs";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | undefined;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS);
        }
      },
    });
  }
  return dbPromise;
}

/** Persist a binary blob under the given key (typically Attachment.id). */
export async function saveBlob(key: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put(STORE_BLOBS, blob, key);
}

/** Load a blob by key.  Returns null when the key does not exist. */
export async function loadBlob(key: string): Promise<Blob | null> {
  const db = await getDb();
  return (await db.get(STORE_BLOBS, key)) ?? null;
}

/** Create a temporary object-URL for a stored blob.  Caller is responsible for
 *  revoking it via `URL.revokeObjectURL` when no longer needed. */
export async function blobObjectUrl(key: string): Promise<string | null> {
  const blob = await loadBlob(key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/** Delete a stored blob by key — called when the attachment/bill is deleted. */
export async function deleteBlob(key: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_BLOBS, key);
}

/** Delete all blobs associated with the given list of attachment IDs. */
export async function deleteBlobsByIds(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getDb();
  const tx = db.transaction(STORE_BLOBS, "readwrite");
  await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
}
