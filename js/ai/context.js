// js/ai/context.js

import {
  getRecentMessages,
  getConversation,
} from "../memory/conversations.js";

import {
  retrieveRelevantMemories,
} from "../memory/retrieval.js";

/*
 * Maximum recent messages that will be
 * included in the AI context.
 */
const DEFAULT_RECENT_MESSAGES = 20;

/*
 * Maximum number of relevant memories.
 */
const DEFAULT_MEMORY_LIMIT = 8;

/* =========================================================
   BUILD AI CONTEXT
   ========================================================= */

/**
 * Build the complete context for an AI request.
 *
 * @param {Object} options
 * @returns {Promise<Object>}
 *
 * Example:
 *
 * const context = await buildAIContext({
 *   conversationId,
 *   userMessage,
 *   currentData
 * });
 */
export async function buildAIContext(
  options = {}
) {
  const {
    conversationId = null,
    userMessage = "",
    currentData = null,

    recentMessageLimit =
      DEFAULT_RECENT_MESSAGES,

    memoryLimit =
      DEFAULT_MEMORY_LIMIT,
  } = options;

  /*
   * Load conversation information.
   */
  const conversation =
    conversationId
      ? await getConversation(
          conversationId
        )
      : null;

  /*
   * Load recent conversation.
   */
  const recentMessages =
    conversationId
      ? await getRecentMessages(
          conversationId,
          recentMessageLimit
        )
      : [];

  /*
   * Retrieve relevant long-term
   * memories.
   *
   * If there is no user message,
   * memory retrieval is skipped.
   */
  let relevantMemories = [];

  if (
    userMessage &&
    typeof userMessage === "string"
  ) {
    relevantMemories =
      await retrieveRelevantMemories(
        userMessage,
        memoryLimit
      );
  }

  return {
    conversation: buildConversationContext(
      conversation
    ),

    messages:
      normalizeMessages(
        recentMessages
      ),

    memories:
      normalizeMemories(
        relevantMemories
      ),

    currentData:
      sanitizeCurrentData(
        currentData
      ),

    request: {
      userMessage:
        typeof userMessage ===
        "string"
          ? userMessage.trim()
          : "",
    },

    metadata: {
      generatedAt: Date.now(),

      messageCount:
        recentMessages.length,

      memoryCount:
        relevantMemories.length,
    },
  };
}

/* =========================================================
   CONVERSATION
   ========================================================= */

/**
 * Keep only useful conversation
 * information.
 */
function buildConversationContext(
  conversation
) {
  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,

    title:
      conversation.title,

    createdAt:
      conversation.createdAt,

    updatedAt:
      conversation.updatedAt,
  };
}

/* =========================================================
   MESSAGES
   ========================================================= */

/**
 * Normalize messages before sending
 * them to the AI layer.
 *
 * We intentionally don't pass the
 * entire IndexedDB record.
 */
function normalizeMessages(
  messages
) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message) =>
        message &&
        typeof message.content ===
          "string" &&
        ["user", "assistant", "system"].includes(
          message.role
        )
    )
    .map((message) => ({
      role: message.role,

      content:
        message.content.trim(),

      createdAt:
        message.createdAt,
    }));
}

/* =========================================================
   MEMORIES
   ========================================================= */

/**
 * Normalize retrieved memories.
 */
function normalizeMemories(
  memories
) {
  if (!Array.isArray(memories)) {
    return [];
  }

  return memories
    .filter(Boolean)
    .map((memory) => ({
      id: memory.id ?? null,

      content:
        typeof memory.content ===
        "string"
          ? memory.content.trim()
          : "",

      score:
        typeof memory.score ===
        "number"
          ? memory.score
          : null,

      createdAt:
        memory.createdAt ?? null,
    }))
    .filter(
      (memory) =>
        memory.content.length > 0
    );
}

/* =========================================================
   CURRENT DATA
   ========================================================= */

/**
 * Sanitize application/page data before
 * passing it to the AI layer.
 *
 * This prevents accidental undefined,
 * functions, DOM nodes, etc.
 */
function sanitizeCurrentData(
  data
) {
  if (data === null || data === undefined) {
    return null;
  }

  /*
   * Primitive values.
   */
  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean"
  ) {
    return data;
  }

  /*
   * Arrays.
   */
  if (Array.isArray(data)) {
    return data.map(
      sanitizeCurrentData
    );
  }

  /*
   * Objects.
   */
  if (
    typeof data === "object"
  ) {
    const result = {};

    for (
      const [key, value] of Object.entries(
        data
      )
    ) {
      /*
       * Don't include functions.
       */
      if (
        typeof value ===
        "function"
      ) {
        continue;
      }

      /*
       * Don't include DOM elements.
       */
      if (
        typeof Element !==
          "undefined" &&
        value instanceof Element
      ) {
        continue;
      }

      result[key] =
        sanitizeCurrentData(
          value
        );
    }

    return result;
  }

  return null;
}

/* =========================================================
   LLM FORMAT
   ========================================================= */

/**
 * Convert our internal context into
 * a clean structure for prompts.js
 * or gemini.js.
 *
 * @param {Object} context
 * @returns {Object}
 */
export function prepareContextForAI(
  context
) {
  if (!context) {
    return {
      conversation: null,
      memories: [],
      messages: [],
      currentData: null,
      userMessage: "",
    };
  }

  return {
    conversation:
      context.conversation,

    memories:
      context.memories,

    messages:
      context.messages,

    currentData:
      context.currentData,

    userMessage:
      context.request?.userMessage ||
      "",
  };
}

/* =========================================================
   CONTEXT TEXT
   ========================================================= */

/**
 * Create a readable context string.
 *
 * prompts.js can use this when constructing
 * the final Gemini prompt.
 *
 * @param {Object} context
 * @returns {string}
 */
export function contextToText(
  context
) {
  const sections = [];

  /*
   * Memories
   */
  if (
    context.memories?.length
  ) {
    sections.push(
      [
        "RELEVANT MEMORY:",
        ...context.memories.map(
          (memory) =>
            `- ${memory.content}`
        ),
      ].join("\n")
    );
  }

  /*
   * Recent conversation
   */
  if (
    context.messages?.length
  ) {
    sections.push(
      [
        "RECENT CONVERSATION:",
        ...context.messages.map(
          (message) =>
            `${formatRole(
              message.role
            )}: ${message.content}`
        ),
      ].join("\n")
    );
  }

  /*
   * Current application data
   */
  if (
    context.currentData !==
      null &&
    context.currentData !==
      undefined
  ) {
    sections.push(
      [
        "CURRENT DATA:",
        JSON.stringify(
          context.currentData,
          null,
          2
        ),
      ].join("\n")
    );
  }

  /*
   * Current request
   */
  if (
    context.request?.userMessage
  ) {
    sections.push(
      [
        "CURRENT USER REQUEST:",
        context.request
          .userMessage,
      ].join("\n")
    );
  }

  return sections.join(
    "\n\n"
  );
}

/**
 * Format message role.
 */
function formatRole(role) {
  switch (role) {
    case "user":
      return "USER";

    case "assistant":
      return "ASSISTANT";

    case "system":
      return "SYSTEM";

    default:
      return "UNKNOWN";
  }
}
