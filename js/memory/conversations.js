// js/memory/conversations.js

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
 * Create a new conversation.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function createConversation(
  options = {}
) {
  const now = Date.now();

  const conversation = {
    id: generateId(),

    title: options.title ?? "New conversation",

    createdAt: now,
    updatedAt: now,
  };

  await addRecord(
    STORES.CONVERSATIONS,
    conversation
  );

  return conversation;
}

/**
 * Get a conversation by ID.
 *
 * @param {string} conversationId
 * @returns {Promise<Object|null>}
 */
export async function getConversation(
  conversationId
) {
  return getRecord(
    STORES.CONVERSATIONS,
    conversationId
  );
}

/**
 * Get all conversations.
 *
 * @returns {Promise<Array>}
 */
export async function getAllConversations() {
  const conversations =
    await getAllRecords(
      STORES.CONVERSATIONS
    );

  return conversations.sort(
    (a, b) =>
      b.updatedAt - a.updatedAt
  );
}

/**
 * Update a conversation.
 *
 * @param {string} conversationId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateConversation(
  conversationId,
  updates
) {
  const existing =
    await getConversation(
      conversationId
    );

  if (!existing) {
    throw new Error(
      `Conversation not found: ${conversationId}`
    );
  }

  const updated = {
    ...existing,
    ...updates,

    // ID should never change.
    id: existing.id,

    updatedAt: Date.now(),
  };

  await putRecord(
    STORES.CONVERSATIONS,
    updated
  );

  return updated;
}

/**
 * Update the conversation title.
 *
 * @param {string} conversationId
 * @param {string} title
 * @returns {Promise<Object>}
 */
export async function renameConversation(
  conversationId,
  title
) {
  const cleanTitle =
    title?.trim();

  if (!cleanTitle) {
    throw new Error(
      "Conversation title cannot be empty."
    );
  }

  return updateConversation(
    conversationId,
    {
      title: cleanTitle,
    }
  );
}

/**
 * Delete a conversation and all
 * messages belonging to it.
 *
 * @param {string} conversationId
 * @returns {Promise<boolean>}
 */
export async function deleteConversation(
  conversationId
) {
  const conversation =
    await getConversation(
      conversationId
    );

  if (!conversation) {
    return false;
  }

  // Delete conversation itself.
  await deleteRecord(
    STORES.CONVERSATIONS,
    conversationId
  );

  // Delete all messages belonging
  // to this conversation.
  const messages =
    await getAllRecords(
      STORES.MESSAGES
    );

  const relatedMessages =
    messages.filter(
      (message) =>
        message.conversationId ===
        conversationId
    );

  for (const message of relatedMessages) {
    await deleteRecord(
      STORES.MESSAGES,
      message.id
    );
  }

  return true;
}
