import { Injectable } from '@angular/core';

type StoredDoc = {
  id: string;
  name: string;
  blob: Blob;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class DocStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private readonly dbName = 'tapsosa-files';
  private readonly storeName = 'files';

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return this.dbPromise;
  }

  async save(name: string, file: Blob): Promise<string> {
    const id = 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const item: StoredDoc = { id, name, blob: file, createdAt: new Date().toISOString() };
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return id;
  }

  async get(id: string): Promise<Blob | null> {
    const db = await this.getDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const r = store.get(id);
      r.onsuccess = () => {
        const item = r.result as StoredDoc | undefined;
        resolve(item ? item.blob : null);
      };
      r.onerror = () => reject(r.error);
    });
  }

  async open(id: string) {
    const blob = await this.get(id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // URL will be released when the new tab is closed by the browser
  }
}
