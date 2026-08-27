// js/storage/export-import.js

import {
  STORES,
  getAllRecords,
  putRecord,
  getDatabase,
} from "../memory/database.js";

const EXPORT_FORMAT = "LocalAI-Memory";
const EXPORT_VERSION = 1;

/*
 * Settings that should never leave the browser.
 *
 * API credentials must NOT be exported.
 */
const EXCLUDED_SETTINGS = new Set([
  "geminiApiKey",
  "apiKey",
]);

/**
 * Build a complete export object.
 *
 * API keys and other sensitive credentials
 * are intentionally excluded.
 *
 * @returns {Promise<Object>}
 */
export async function createExportData() {
  const conversations =
    await getAllRecords(
      STORES.CONVERSATIONS
    );

  const messages =
    await getAllRecords(
      STORES.MESSAGES
    );

  const memories =
    await getAllRecords(
      STORES.MEMORIES
    );

  const allSettings =
    await getAllRecords(
      STORES.SETTINGS
    );

  const settings =
    allSettings.filter(
      (setting) =>
        !EXCLUDED_SETTINGS.has(
          setting.key
        )
    );

  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,

    exportedAt:
      new Date().toISOString(),

    data: {
      conversations,
      messages,
      memories,
      settings,
    },
  };
}

/**
 * Convert export data to a JSON file
 * and trigger browser download.
 *
 * @returns {Promise<void>}
 */
export async function exportData() {
  const exportData =
    await createExportData();

  const json = JSON.stringify(
    exportData,
    null,
    2
  );

  const blob = new Blob(
    [json],
    {
      type: "application/json",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  const date =
    new Date()
      .toISOString()
      .slice(0, 10);

  link.href = url;
  link.download =
    `local-ai-memory-${date}.json`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

/**
 * Read a selected file.
 *
 * @param {File} file
 * @returns {Promise<Object>}
 */
function readImportFile(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        reject(
          new Error(
            "No file selected."
          )
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        try {
          const parsed =
            JSON.parse(
              reader.result
            );

          resolve(parsed);
        } catch {
          reject(
            new Error(
              "Invalid JSON file."
            )
          );
        }
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the file."
          )
        );
      };

      reader.readAsText(file);
    }
  );
}

/**
 * Validate imported data.
 *
 * @param {Object} data
 * @returns {Object}
 */
function validateImportData(data) {
  if (!data || typeof data !== "object") {
    throw new Error(
      "Invalid import data."
    );
  }

  if (data.format !== EXPORT_FORMAT) {
    throw new Error(
      "This file is not a valid LocalAI memory export."
    );
  }

  if (
    typeof data.version !== "number" ||
    data.version > EXPORT_VERSION
  ) {
    throw new Error(
      "This memory file was created by a newer version of the application."
    );
  }

  if (
    !data.data ||
    typeof data.data !== "object"
  ) {
    throw new Error(
      "Import data is incomplete."
    );
  }

  const {
    conversations = [],
    messages = [],
    memories = [],
    settings = [],
  } = data.data;

  if (
    !Array.isArray(conversations) ||
    !Array.isArray(messages) ||
    !Array.isArray(memories) ||
    !Array.isArray(settings)
  ) {
    throw new Error(
      "Invalid data structure."
    );
  }

  return {
    conversations,
    messages,
    memories,
    settings,
  };
}

/**
 * Import data from a File object.
 *
 * @param {File} file
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function importData(
  file,
  options = {}
) {
  const {
    mode = "merge",
  } = options;

  if (
    mode !== "merge" &&
    mode !== "replace"
  ) {
    throw new Error(
      'Import mode must be "merge" or "replace".'
    );
  }

  const rawData =
    await readImportFile(file);

  const data =
    validateImportData(
      rawData
    );

  const db =
    await getDatabase();

  /*
   * Replace mode clears existing
   * application data before restoring.
   *
   * API key is never touched.
   */
  if (mode === "replace") {
    const transaction =
      db.transaction(
        [
          STORES.CONVERSATIONS,
          STORES.MESSAGES,
          STORES.MEMORIES,
          STORES.SETTINGS,
        ],
        "readwrite"
      );

    transaction
      .objectStore(
        STORES.CONVERSATIONS
      )
      .clear();

    transaction
      .objectStore(
        STORES.MESSAGES
      )
      .clear();

    transaction
      .objectStore(
        STORES.MEMORIES
      )
      .clear();

    /*
     * Important:
     * We do NOT clear settings here
     * because API credentials must remain
     * local and untouched.
     *
     * Safe settings will be overwritten
     * below.
     */
  }

  /*
   * Use one transaction so the import
   * remains consistent.
   */
  const transaction =
    db.transaction(
      [
        STORES.CONVERSATIONS,
        STORES.MESSAGES,
        STORES.MEMORIES,
        STORES.SETTINGS,
      ],
      "readwrite"
    );

  const conversationStore =
    transaction.objectStore(
      STORES.CONVERSATIONS
    );

  const messageStore =
    transaction.objectStore(
      STORES.MESSAGES
    );

  const memoryStore =
    transaction.objectStore(
      STORES.MEMORIES
    );

  const settingsStore =
    transaction.objectStore(
      STORES.SETTINGS
    );

  /*
   * Conversations
   */
  for (const conversation of data.conversations) {
    if (
      conversation &&
      typeof conversation.id === "string"
    ) {
      conversationStore.put(
        conversation
      );
    }
  }

  /*
   * Messages
   */
  for (const message of data.messages) {
    if (
      message &&
      typeof message.id === "string" &&
      typeof message.conversationId ===
        "string"
    ) {
      messageStore.put(message);
    }
  }

  /*
   * Memories
   */
  for (const memory of data.memories) {
    if (
      memory &&
      typeof memory.id === "string" &&
      typeof memory.content === "string"
    ) {
      memoryStore.put(memory);
    }
  }

  /*
   * Safe settings only.
   */
  for (const setting of data.settings) {
    if (
      setting &&
      typeof setting.key === "string" &&
      !EXCLUDED_SETTINGS.has(
        setting.key
      )
    ) {
      settingsStore.put(setting);
    }
  }

  return new Promise(
    (resolve, reject) => {
      transaction.oncomplete = () => {
        resolve({
          success: true,
          mode,

          imported: {
            conversations:
              data.conversations.length,

            messages:
              data.messages.length,

            memories:
              data.memories.length,

            settings:
              data.settings.length,
          },
        });
      };

      transaction.onerror = () => {
        reject(
          transaction.error ||
            new Error(
              "Import transaction failed."
            )
        );
      };

      transaction.onabort = () => {
        reject(
          transaction.error ||
            new Error(
              "Import was aborted."
            )
        );
      };
    }
  );
}

/**
 * Open the browser file picker and
 * import a selected JSON file.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function selectAndImportData(
  options = {}
) {
  return new Promise(
    (resolve, reject) => {
      const input =
        document.createElement(
          "input"
        );

      input.type = "file";
      input.accept =
        "application/json,.json";

      input.onchange = async () => {
        try {
          const file =
            input.files?.[0];

          if (!file) {
            reject(
              new Error(
                "No file selected."
              )
            );

            return;
          }

          const result =
            await importData(
              file,
              options
            );

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    }
  );
}
