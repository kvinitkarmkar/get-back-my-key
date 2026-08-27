// js/memory/database.js

const DB_NAME = "get-back-my-key";
const DB_VERSION = 1;

// Object stores
export const STORES = {
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  MEMORIES: "memories",
  SETTINGS: "settings",
};

let dbInstance = null;

/**
 * Initialize IndexedDB
 */
export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Return existing connection
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    if (!("indexedDB" in window)) {
      reject(
        new Error("IndexedDB is not supported by this browser.")
      );
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    /**
     * Runs when database is created
     * or database version is upgraded.
     */
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // -----------------------------
      // Conversations
      // -----------------------------
      if (!db.objectStoreNames.contains(STORES.CONVERSATIONS)) {
        const conversationStore = db.createObjectStore(
          STORES.CONVERSATIONS,
          {
            keyPath: "id",
          }
        );

        conversationStore.createIndex(
          "updatedAt",
          "updatedAt",
          { unique: false }
        );
      }

      // -----------------------------
      // Messages
      // -----------------------------
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = db.createObjectStore(
          STORES.MESSAGES,
          {
            keyPath: "id",
          }
        );

        messageStore.createIndex(
          "conversationId",
          "conversationId",
          { unique: false }
        );

        messageStore.createIndex(
          "createdAt",
          "createdAt",
          { unique: false }
        );
      }

      // -----------------------------
      // Memories
      // -----------------------------
      if (!db.objectStoreNames.contains(STORES.MEMORIES)) {
        const memoryStore = db.createObjectStore(
          STORES.MEMORIES,
          {
            keyPath: "id",
          }
        );

        memoryStore.createIndex(
          "createdAt",
          "createdAt",
          { unique: false }
        );

        memoryStore.createIndex(
          "updatedAt",
          "updatedAt",
          { unique: false }
        );
      }

      // -----------------------------
      // Settings
      // -----------------------------
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, {
          keyPath: "key",
        });
      }
    };

    /**
     * Database successfully opened
     */
    request.onsuccess = (event) => {
      dbInstance = event.target.result;

      dbInstance.onclose = () => {
        dbInstance = null;
      };

      dbInstance.onerror = (event) => {
        console.error(
          "IndexedDB error:",
          event.target.error
        );
      };

      resolve(dbInstance);
    };

    /**
     * Database failed to open
     */
    request.onerror = (event) => {
      reject(
        event.target.error ||
          new Error("Failed to open IndexedDB.")
      );
    };

    /**
     * Another tab/version is blocking upgrade
     */
    request.onblocked = () => {
      console.warn(
        "IndexedDB upgrade is blocked. Please close other tabs using this app."
      );
    };
  });
}

/**
 * Get the current database instance.
 */
export async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  return initializeDatabase();
}

/**
 * Add a new record.
 */
export async function addRecord(storeName, data) {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);

    const request = store.add(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Insert or update a record.
 */
export async function putRecord(storeName, data) {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);

    const request = store.put(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get a record by primary key.
 */
export async function getRecord(storeName, key) {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readonly"
    );

    const store = transaction.objectStore(storeName);

    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get all records from a store.
 */
export async function getAllRecords(storeName) {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readonly"
    );

    const store = transaction.objectStore(storeName);

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Delete a record.
 */
export async function deleteRecord(storeName, key) {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);

    const request = store.delete(key);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Clear an entire store.
 */
export async function clearStore(storeName) {
  const db = await getDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      storeName,
      "readwrite"
    );

    const store = transaction.objectStore(storeName);

    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
