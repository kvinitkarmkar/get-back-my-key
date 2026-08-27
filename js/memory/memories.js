// js/memory/memories.js

import {
  STORES,
  addRecord,
  putRecord,
  getRecord,
  getAllRecords,
  deleteRecord,
} from "./database.js";

/**
 * Generate a unique ID.
 */
function generateId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/**
 * Create and save a new memory.
 *
 * @param {Object} memoryData
 * @returns {Promise<Object>}
 */
export async function createMemory(memoryData) {
  const now = Date.now();

  const memory = {
    id: generateId(),
    content: memoryData.content,
    type: memoryData.type ?? "general",
    importance: memoryData.importance ?? 1,
    createdAt: now,
    updatedAt: now,
  };

  await addRecord(
    STORES.MEMORIES,
    memory
  );

  return memory;
}

/**
 * Get a memory by ID.
 *
 * @param {string} memoryId
 * @returns {Promise<Object|null>}
 */
export async function getMemory(memoryId) {
  return getRecord(
    STORES.MEMORIES,
    memoryId
  );
}

/**
 * Get all stored memories.
 *
 * @returns {Promise<Array>}
 */
export async function getAllMemories() {
  return getAllRecords(
    STORES.MEMORIES
  );
}

/**
 * Update an existing memory.
 *
 * @param {string} memoryId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateMemory(
  memoryId,
  updates
) {
  const existingMemory = await getMemory(
    memoryId
  );

  if (!existingMemory) {
    throw new Error(
      `Memory not found: ${memoryId}`
    );
  }

  const updatedMemory = {
    ...existingMemory,
    ...updates,
    id: existingMemory.id,
    updatedAt: Date.now(),
  };

  await putRecord(
    STORES.MEMORIES,
    updatedMemory
  );

  return updatedMemory;
}

/**
 * Delete a memory.
 *
 * @param {string} memoryId
 * @returns {Promise<boolean>}
 */
export async function deleteMemory(
  memoryId
) {
  return deleteRecord(
    STORES.MEMORIES,
    memoryId
  );
}

/**
 * Delete all memories.
 *
 * @returns {Promise<boolean>}
 */
export async function deleteAllMemories() {
  const memories = await getAllMemories();

  for (const memory of memories) {
    await deleteMemory(memory.id);
  }

  return true;
}

/**
 * Search memories locally.
 *
 * This is a simple keyword-based search for now.
 * Later this can be replaced with embeddings/
 * semantic retrieval without changing the rest
 * of the application.
 *
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function searchMemories(
  query,
  limit = 5
) {
  const memories = await getAllMemories();

  if (!query?.trim()) {
    return memories
      .sort(
        (a, b) =>
          b.importance - a.importance
      )
      .slice(0, limit);
  }

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const results = memories
    .map((memory) => {
      const content =
        memory.content.toLowerCase();

      let score = 0;

      for (const word of words) {
        if (content.includes(word)) {
          score++;
        }
      }

      // Important memories get a small boost.
      score += memory.importance * 0.1;

      return {
        ...memory,
        score,
      };
    })
    .filter(
      (memory) => memory.score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);

  return results;
}
