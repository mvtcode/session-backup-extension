/**
 * Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('Session Backup Extension installed.');
});

// Helper to get cookies for a specific domain
async function getCookies(url: string) {
  return new Promise((resolve) => {
    chrome.cookies.getAll({ url }, (cookies) => {
      resolve(cookies);
    });
  });
}

// Helper to set cookies
async function setCookies(url: string, cookies: chrome.cookies.Cookie[]) {
  for (const cookie of cookies) {
    const newCookie: chrome.cookies.SetDetails = {
      url: url,
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      expirationDate: cookie.expirationDate,
      sameSite: cookie.sameSite,
    };
    await chrome.cookies.set(newCookie);
  }
}

// THIS FUNCTION IS INJECTED INTO THE WEB PAGE
function contentScriptMain() {
  // Check if already initialized to avoid multiple listeners
  if ((window as any).__sessionBackupInitialized) return;
  (window as any).__sessionBackupInitialized = true;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PING') {
      sendResponse({ success: true });
    } else if (message.type === 'GET_STORAGE_DATA') {
      (async () => {
        const { options } = message.payload || {
          options: {
            localStorage: true,
            sessionStorage: true,
            indexedDB: true,
            cacheStorage: true,
          },
        };
        const data: any = {};

        if (options.localStorage) data.localStorage = { ...localStorage };
        if (options.sessionStorage) data.sessionStorage = { ...sessionStorage };

        if (options.indexedDB) {
          data.indexedDB = await exportIndexedDB();
        }

        if (options.cacheStorage) {
          data.cacheStorage = await exportCacheStorage();
        }

        sendResponse(data);
      })();
    } else if (message.type === 'SET_STORAGE_DATA') {
      (async () => {
        const {
          localStorage: ls,
          sessionStorage: ss,
          indexedDB: idb,
          cacheStorage: cache,
          mode,
        } = message.payload;
        if (mode === 'overwrite') {
          localStorage.clear();
          sessionStorage.clear();
          // Note: Clearing IndexedDB and Cache Storage is complex, usually we just overwrite/merge
        }
        if (ls)
          Object.entries(ls).forEach(([k, v]) =>
            localStorage.setItem(k, v as string),
          );
        if (ss)
          Object.entries(ss).forEach(([k, v]) =>
            sessionStorage.setItem(k, v as string),
          );

        if (idb) await importIndexedDB(idb);
        if (cache) await importCacheStorage(cache);

        sendResponse({ success: true });
      })();
    }
    return true;
  });

  async function exportIndexedDB() {
    if (!window.indexedDB.databases) return null;
    const dbs = await window.indexedDB.databases();
    const result: any[] = [];

    for (const dbInfo of dbs) {
      if (!dbInfo.name) continue;
      try {
        const dbData = await new Promise((resolve, reject) => {
          const request = indexedDB.open(dbInfo.name!);
          request.onerror = () => reject(request.error);
          request.onsuccess = async () => {
            const db = request.result;
            const stores: any = {};
            const storeNames = Array.from(db.objectStoreNames);

            for (const storeName of storeNames) {
              stores[storeName] = await new Promise((res, rej) => {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const getAll = store.getAll();
                getAll.onsuccess = () => res(getAll.result);
                getAll.onerror = () => rej(getAll.error);
              });
            }
            db.close();
            resolve({ name: dbInfo.name, version: dbInfo.version, stores });
          };
        });
        result.push(dbData);
      } catch (e) {
        console.error(`Failed to export IndexedDB ${dbInfo.name}:`, e);
      }
    }
    return result;
  }

  async function importIndexedDB(dbs: any[]) {
    for (const dbData of dbs) {
      const { name, version, stores } = dbData;
      await new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          Object.keys(stores).forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          });
        };
        request.onsuccess = async () => {
          const db = request.result;
          for (const [storeName, items] of Object.entries(stores)) {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.clear();
            (items as any[]).forEach((item) => store.put(item));
          }
          db.close();
          resolve(true);
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  async function exportCacheStorage() {
    if (!window.caches) return null;
    const keys = await caches.keys();
    const result: any = {};

    for (const key of keys) {
      const cache = await caches.open(key);
      const requests = await cache.keys();
      const entries = [];

      for (const req of requests) {
        const res = await cache.match(req);
        if (res) {
          const blob = await res.blob();
          const base64Body = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          entries.push({
            url: req.url,
            method: req.method,
            headers: Object.fromEntries(res.headers.entries()),
            status: res.status,
            statusText: res.statusText,
            body: base64Body,
          });
        }
      }
      result[key] = entries;
    }
    return result;
  }

  async function importCacheStorage(cacheData: any) {
    if (!window.caches) return;
    for (const [key, entries] of Object.entries(cacheData)) {
      const cache = await caches.open(key);
      for (const entry of entries as any[]) {
        try {
          const resBody = await fetch(entry.body).then((r) => r.blob());
          const response = new Response(resBody, {
            status: entry.status,
            statusText: entry.statusText,
            headers: entry.headers,
          });
          await cache.put(entry.url, response);
        } catch (e) {
          console.error(`Failed to restore cache entry ${entry.url}:`, e);
        }
      }
    }
  }
}

// Helper to ensure content script is injected
async function ensureContentScript(tabId: number) {
  try {
    // Try to ping first
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
  } catch {
    // If ping fails, inject the function
    await chrome.scripting.executeScript({
      target: { tabId },
      func: contentScriptMain,
    });
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'BACKUP_SESSION') {
    handleBackup(message.payload).then(sendResponse);
    return true;
  } else if (message.type === 'RESTORE_SESSION') {
    handleRestore(message.payload).then(sendResponse);
    return true;
  }
});

async function handleBackup({
  tabId,
  url,
  options,
}: {
  tabId: number;
  url: string;
  options: any;
}) {
  try {
    await ensureContentScript(tabId);

    let cookies: any[] = [];
    if (options.cookies) {
      cookies = (await getCookies(url)) as any[];
    }

    const storageData = await chrome.tabs.sendMessage(tabId, {
      type: 'GET_STORAGE_DATA',
      payload: { options },
    });

    return {
      success: true,
      data: {
        url,
        timestamp: new Date().toISOString(),
        cookies,
        ...storageData,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function handleRestore({
  tabId,
  url,
  data,
  mode,
}: {
  tabId: number;
  url: string;
  data: any;
  mode: string;
}) {
  try {
    await ensureContentScript(tabId);
    if (data.cookies && data.cookies.length > 0) {
      await setCookies(url, data.cookies);
    }
    await chrome.tabs.sendMessage(tabId, {
      type: 'SET_STORAGE_DATA',
      payload: {
        localStorage: data.localStorage,
        sessionStorage: data.sessionStorage,
        indexedDB: data.indexedDB,
        cacheStorage: data.cacheStorage,
        mode,
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
