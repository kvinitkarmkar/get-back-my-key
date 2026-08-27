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
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/* =========================================================
   CONVERSATIONS
   ========================================================= */

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

    title:
      options.title?.trim() ||
      "New conversation",

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
 * Newest updated conversation comes first.
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

    // Never allow ID replacement.
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
 * Rename a conversation.
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

/* =========================================================
   MESSAGES
   ========================================================= */

/**
 * Add a message to a conversation.
 *
 * @param {string} conversationId
 * @param {Object} messageData
 * @returns {Promise<Object>}
 */
export async function addMessage(
  conversationId,
  messageData
) {
  const conversation =
    await getConversation(
      conversationId
    );

  if (!conversation) {
    throw new Error(
      `Conversation not found: ${conversationId}`
    );
  }

  if (
    !messageData ||
    typeof messageData.content !==
      "string"
  ) {
    throw new Error(
      "Message content is required."
    );
  }

  const role =
    messageData.role;

  const validRoles = [
    "user",
    "assistant",
    "system",
  ];

  if (!validRoles.includes(role)) {
    throw new Error(
      `Invalid message role: ${role}`
    );
  }

  const message = {
    id: generateId(),

    conversationId,

    role,

    content:
      messageData.content,

    createdAt: Date.now(),

    /*
     * Optional metadata.
     *
     * Useful later for:
     * - model name
     * - token usage
     * - generation time
     * - structured response
     */
    metadata:
      messageData.metadata ?? null,
  };

  await addRecord(
    STORES.MESSAGES,
    message
  );

  /*
   * Update conversation's
   * last activity time.
   */
  await updateConversation(
    conversationId,
    {}
  );

  return message;
}

/**
 * Get all messages belonging
 * to a conversation.
 *
 * @param {string} conversationId
 * @returns {Promise<Array>}
 */
export async function getMessages(
  conversationId
) {
  const messages =
    await getAllRecords(
      STORES.MESSAGES
    );

  return messages
    .filter(
      (message) =>
        message.conversationId ===
        conversationId
    )
    .sort(
      (a, b) =>
        a.createdAt - b.createdAt
    );
}

/**
 * Get the most recent messages.
 *
 * Useful for sending recent context
 * to the LLM.
 *
 * @param {string} conversationId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRecentMessages(
  conversationId,
  limit = 20
) {
  const messages =
    await getMessages(
      conversationId
    );

  return messages.slice(-limit);
}

/**
 * Get the latest message.
 *
 * @param {string} conversationId
 * @returns {Promise<Object|null>}
 */
export async function getLastMessage(
  conversationId
) {
  const messages =
    await getRecentMessages(
      conversationId,
      1
    );

  return messages[0] ?? null;
}

/**
 * Get a message by ID.
 *
 * @param {string} messageId
 * @returns {Promise<Object|null>}
 */
export async function getMessage(
  messageId
) {
  return getRecord(
    STORES.MESSAGES,
    messageId
  );
}

/**
 * Delete a single message.
 *
 * @param {string} messageId
 * @returns {Promise<boolean>}
 */
export async function deleteMessage(
  messageId
) {
  return deleteRecord(
    STORES.MESSAGES,
    messageId
  );
}

/* =========================================================
   DELETE CONVERSATION
   ========================================================= */

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

  const messages =
    await getAllRecords(
      STORES.MESSAGES
    );

  const transactionMessages =
    messages.filter(
      (message) =>
        message.conversationId ===
        conversationId
    );

  /*
   * Delete all messages first.
   */
  for (
    const message of transactionMessages
  ) {
    await deleteRecord(
      STORES.MESSAGES,
      message.id
    );
  }

  /*
   * Delete conversation.
   */
  await deleteRecord(
    STORES.CONVERSATIONS,
    conversationId
  );

  return true;
}

/**
 * Delete all conversations and
 * all associated messages.
 *
 * @returns {Promise<boolean>}
 */
export async function deleteAllConversations() {
  const conversations =
    await getAllConversations();

  for (
    const conversation of conversations
  ) {
    await deleteConversation(
      conversation.id
    );
  }

  return true;
}
