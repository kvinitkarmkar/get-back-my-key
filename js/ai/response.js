// js/ai/response.js

/* =========================================================
   RESPONSE NORMALIZATION
   ========================================================= */

/**
 * Normalize a Gemini response into a
 * predictable application format.
 *
 * @param {Object} response
 * @returns {Object}
 */
export function normalizeResponse(
  response
) {
  if (!response) {
    throw new Error(
      "AI response is empty."
    );
  }

  const text =
    extractText(response);

  if (!text) {
    throw new Error(
      "AI returned an empty response."
    );
  }

  return {
    text,

    model:
      response.model ??
      null,

    metadata: {
      usage:
        response.metadata
          ?.usage ??
        null,

      generatedAt:
        response.metadata
          ?.generatedAt ??
        Date.now(),
    },

    raw:
      response.raw ??
      null,
  };
}

/* =========================================================
   TEXT EXTRACTION
   ========================================================= */

/**
 * Extract text from our normalized
 * Gemini response.
 *
 * @param {Object|string} response
 * @returns {string}
 */
export function extractText(
  response
) {
  /*
   * Already a plain string.
   */
  if (
    typeof response ===
    "string"
  ) {
    return response.trim();
  }

  /*
   * Our normalized response.
   */
  if (
    typeof response?.text ===
    "string"
  ) {
    return response.text.trim();
  }

  /*
   * Raw Gemini response.
   */
  const parts =
    response?.raw
      ?.candidates?.[0]
      ?.content?.parts;

  if (Array.isArray(parts)) {
    return parts
      .map(
        (part) =>
          typeof part?.text ===
          "string"
            ? part.text
            : ""
      )
      .join("")
      .trim();
  }

  /*
   * Direct raw Gemini object.
   */
  const directParts =
    response?.candidates?.[0]
      ?.content?.parts;

  if (
    Array.isArray(
      directParts
    )
  ) {
    return directParts
      .map(
        (part) =>
          typeof part?.text ===
          "string"
            ? part.text
            : ""
      )
      .join("")
      .trim();
  }

  return "";
}

/* =========================================================
   RESPONSE STATUS
   ========================================================= */

/**
 * Check whether the AI response
 * contains usable text.
 *
 * @param {Object|string} response
 * @returns {boolean}
 */
export function isValidResponse(
  response
) {
  try {
    return Boolean(
      extractText(response)
    );
  } catch {
    return false;
  }
}

/* =========================================================
   METADATA
   ========================================================= */

/**
 * Extract token usage information.
 *
 * @param {Object} response
 * @returns {Object|null}
 */
export function getUsageMetadata(
  response
) {
  return (
    response?.metadata
      ?.usage ??
    response?.raw
      ?.usageMetadata ??
    null
  );
}

/**
 * Get model name used for
 * generation.
 *
 * @param {Object} response
 * @returns {string|null}
 */
export function getResponseModel(
  response
) {
  return (
    response?.model ??
    null
  );
}

/* =========================================================
   ERROR / BLOCK HANDLING
   ========================================================= */

/**
 * Check whether Gemini stopped generation
 * because of a safety/content block.
 *
 * @param {Object} response
 * @returns {boolean}
 */
export function isBlockedResponse(
  response
) {
  const finishReason =
    response?.raw
      ?.candidates?.[0]
      ?.finishReason;

  return (
    finishReason ===
      "SAFETY" ||
    finishReason ===
      "BLOCKLIST" ||
    finishReason ===
      "PROHIBITED_CONTENT"
  );
}

/**
 * Get the reason why generation stopped.
 *
 * @param {Object} response
 * @returns {string|null}
 */
export function getFinishReason(
  response
) {
  return (
    response?.raw
      ?.candidates?.[0]
      ?.finishReason ??
    null
  );
}

/* =========================================================
   DISPLAY TEXT
   ========================================================= */

/**
 * Prepare AI text for chat display.
 *
 * This function intentionally does NOT
 * interpret the response as HTML.
 *
 * @param {Object|string} response
 * @returns {string}
 */
export function getDisplayText(
  response
) {
  return extractText(
    response
  );
}
