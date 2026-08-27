// js/utils/validation.js

/* =========================================================
   STRING
   ========================================================= */

/**
 * Check whether a value is a non-empty string.
 */
export function isNonEmptyString(
  value
) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

/**
 * Validate a string.
 */
export function validateString(
  value,
  options = {}
) {
  const {
    required = true,
    minLength = 0,
    maxLength = Infinity,
  } = options;

  if (
    typeof value !== "string"
  ) {
    return !required;
  }

  const clean =
    value.trim();

  if (
    required &&
    clean.length === 0
  ) {
    return false;
  }

  return (
    clean.length >= minLength &&
    clean.length <= maxLength
  );
}

/* =========================================================
   API KEY
   ========================================================= */

/**
 * Basic Gemini API key validation.
 *
 * This does NOT verify whether the key
 * is actually valid. Only Gemini can do that.
 */
export function isValidApiKey(
  apiKey
) {
  if (
    typeof apiKey !== "string"
  ) {
    return false;
  }

  const key =
    apiKey.trim();

  /*
   * Gemini keys are normally non-empty
   * strings. Keep this intentionally
   * provider-tolerant so a future key
   * format change doesn't break the app.
   */
  return (
    key.length >= 20 &&
    key.length <= 512
  );
}

/* =========================================================
   ID
   ========================================================= */

/**
 * Validate an application ID.
 */
export function isValidId(
  id
) {
  return (
    typeof id === "string" &&
    id.trim().length > 0
  );
}

/* =========================================================
   ROLE
   ========================================================= */

const VALID_MESSAGE_ROLES = [
  "user",
  "assistant",
  "system",
];

/**
 * Validate chat message role.
 */
export function isValidMessageRole(
  role
) {
  return VALID_MESSAGE_ROLES.includes(
    role
  );
}

/* =========================================================
   MESSAGE
   ========================================================= */

/**
 * Validate a chat message object.
 */
export function isValidMessage(
  message
) {
  if (
    !message ||
    typeof message !==
      "object"
  ) {
    return false;
  }

  return (
    isValidId(message.id) &&
    isValidId(
      message.conversationId
    ) &&
    isValidMessageRole(
      message.role
    ) &&
    isNonEmptyString(
      message.content
    )
  );
}

/* =========================================================
   CONVERSATION
   ========================================================= */

/**
 * Validate a conversation object.
 */
export function isValidConversation(
  conversation
) {
  if (
    !conversation ||
    typeof conversation !==
      "object"
  ) {
    return false;
  }

  return (
    isValidId(
      conversation.id
    ) &&
    isNonEmptyString(
      conversation.title
    ) &&
    typeof conversation.createdAt ===
      "number" &&
    typeof conversation.updatedAt ===
      "number"
  );
}

/* =========================================================
   LIMIT
   ========================================================= */

/**
 * Validate a numeric limit.
 */
export function isValidLimit(
  value,
  options = {}
) {
  const {
    min = 1,
    max = 100,
  } = options;

  return (
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

/* =========================================================
   OBJECT
   ========================================================= */

/**
 * Check whether value is a plain object.
 */
export function isPlainObject(
  value
) {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return false;
  }

  return (
    Object.getPrototypeOf(
      value
    ) === Object.prototype
  );
}

/* =========================================================
   ARRAY
   ========================================================= */

/**
 * Check whether value is a non-empty array.
 */
export function isNonEmptyArray(
  value
) {
  return (
    Array.isArray(value) &&
    value.length > 0
  );
}
