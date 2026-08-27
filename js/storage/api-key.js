// js/storage/api-key.js

import {
  STORES,
  putRecord,
  getRecord,
  deleteRecord,
} from "../memory/database.js";

const API_KEY_SETTING = "geminiApiKey";

/**
 * Save Gemini API key locally.
 *
 * The key is stored only in this browser's
 * IndexedDB and is never sent to our backend.
 *
 * @param {string} apiKey
 * @returns {Promise<boolean>}
 */
export async function saveApiKey(apiKey) {
  if (
    typeof apiKey !== "string" ||
    !apiKey.trim()
  ) {
    throw new Error(
      "A valid API key is required."
    );
  }

  const cleanKey = apiKey.trim();

  await putRecord(
    STORES.SETTINGS,
    {
      key: API_KEY_SETTING,
      value: cleanKey,
      updatedAt: Date.now(),
    }
  );

  return true;
}

/**
 * Get the locally stored Gemini API key.
 *
 * @returns {Promise<string|null>}
 */
export async function getApiKey() {
  const record = await getRecord(
    STORES.SETTINGS,
    API_KEY_SETTING
  );

  if (
    !record ||
    typeof record.value !== "string"
  ) {
    return null;
  }

  return record.value;
}

/**
 * Check whether a Gemini API key
 * is configured.
 *
 * @returns {Promise<boolean>}
 */
export async function hasApiKey() {
  const apiKey =
    await getApiKey();

  return Boolean(apiKey);
}

/**
 * Remove the locally stored API key.
 *
 * @returns {Promise<boolean>}
 */
export async function removeApiKey() {
  return deleteRecord(
    STORES.SETTINGS,
    API_KEY_SETTING
  );
}

/**
 * Return a masked version of the key
 * for UI display.
 *
 * Never display the complete key.
 *
 * @returns {Promise<string|null>}
 */
export async function getMaskedApiKey() {
  const apiKey =
    await getApiKey();

  if (!apiKey) {
    return null;
  }

  if (apiKey.length <= 8) {
    return "••••••••";
  }

  return `${apiKey.slice(
    0,
    4
  )}••••••••${apiKey.slice(-4)}`;
}
