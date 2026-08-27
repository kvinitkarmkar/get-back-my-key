// js/storage/settings.js

import {
  STORES,
  putRecord,
  getRecord,
  getAllRecords,
  deleteRecord,
} from "../memory/database.js";

/**
 * Save or update a setting.
 *
 * @param {string} key
 * @param {*} value
 * @returns {Promise<Object>}
 */
export async function setSetting(key, value) {
  if (!key || typeof key !== "string") {
    throw new Error("Setting key must be a valid string.");
  }

  const record = {
    key,
    value,
    updatedAt: Date.now(),
  };

  await putRecord(
    STORES.SETTINGS,
    record
  );

  return record;
}

/**
 * Get a setting by key.
 *
 * @param {string} key
 * @param {*} defaultValue
 * @returns {Promise<*>}
 */
export async function getSetting(
  key,
  defaultValue = null
) {
  if (!key || typeof key !== "string") {
    return defaultValue;
  }

  const record = await getRecord(
    STORES.SETTINGS,
    key
  );

  if (!record) {
    return defaultValue;
  }

  return record.value;
}

/**
 * Check whether a setting exists.
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function hasSetting(key) {
  const record = await getRecord(
    STORES.SETTINGS,
    key
  );

  return record !== null;
}

/**
 * Get all application settings.
 *
 * @returns {Promise<Object>}
 */
export async function getAllSettings() {
  const records =
    await getAllRecords(
      STORES.SETTINGS
    );

  return records.reduce(
    (settings, record) => {
      settings[record.key] =
        record.value;

      return settings;
    },
    {}
  );
}

/**
 * Delete a setting.
 *
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function deleteSetting(key) {
  return deleteRecord(
    STORES.SETTINGS,
    key
  );
}

/**
 * Reset all application settings.
 *
 * @returns {Promise<boolean>}
 */
export async function resetSettings() {
  const records =
    await getAllRecords(
      STORES.SETTINGS
    );

  for (const record of records) {
    await deleteSetting(record.key);
  }

  return true;
}
