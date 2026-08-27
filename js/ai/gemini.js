// js/ai/gemini.js

import {
  getApiKey,
} from "../storage/api-key.js";

import {
  buildPrompt,
  buildChatHistory,
} from "./prompts.js";

/*
 * Gemini REST API.
 *
 * Keep the model configurable so we can
 * change it later without rewriting the
 * request logic.
 */
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";

const DEFAULT_MODEL =
  "gemini-2.5-flash";

/*
 * Request configuration.
 */
const DEFAULT_TEMPERATURE = 0.7;

const DEFAULT_MAX_OUTPUT_TOKENS =
  2048;

/* =========================================================
   MAIN GENERATION
   ========================================================= */

/**
 * Generate an AI response using Gemini.
 *
 * @param {Object} context
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function generateAIResponse(
  context,
  options = {}
) {
  const {
    model = DEFAULT_MODEL,

    temperature =
      DEFAULT_TEMPERATURE,

    maxOutputTokens =
      DEFAULT_MAX_OUTPUT_TOKENS,
  } = options;

  /*
   * Get locally stored API key.
   */
  const apiKey =
    await getApiKey();

  if (!apiKey) {
    throw new Error(
      "API_KEY_MISSING"
    );
  }

  /*
   * Build prompt.
   */
  const prompt =
    buildPrompt(context);

  /*
   * Build request body.
   */
  const body = {
    system_instruction: {
      parts: [
        {
          text: prompt.system,
        },
      ],
    },

    contents: [
      {
        role: "user",

        parts: [
          {
            text: prompt.user,
          },
        ],
      },
    ],

    generationConfig: {
      temperature,

      maxOutputTokens,
    },
  };

  /*
   * Send request directly to Gemini.
   */
  const response =
    await fetch(
      buildEndpoint(
        model,
        apiKey
      ),
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(body),
      }
    );

  /*
   * Parse response.
   */
  const data =
    await parseResponse(
      response
    );

  /*
   * Handle API errors.
   */
  if (!response.ok) {
    throw createGeminiError(
      response.status,
      data
    );
  }

  /*
   * Return raw provider response
   * plus normalized text.
   */
  return {
    text:
      extractText(data),

    model,

    raw: data,

    metadata: {
      model,

      generatedAt:
        Date.now(),

      usage:
        data.usageMetadata ??
        null,
    },
  };
}

/* =========================================================
   CHAT GENERATION
   ========================================================= */

/**
 * Generate a response using explicit
 * conversation history.
 *
 * Useful when you want Gemini to receive
 * structured chat history.
 *
 * @param {Array} messages
 * @param {string} userMessage
 * @param {Object} options
 */
export async function generateChatResponse(
  messages = [],
  userMessage,
  options = {}
) {
  if (
    typeof userMessage !==
      "string" ||
    !userMessage.trim()
  ) {
    throw new Error(
      "USER_MESSAGE_REQUIRED"
    );
  }

  const apiKey =
    await getApiKey();

  if (!apiKey) {
    throw new Error(
      "API_KEY_MISSING"
    );
  }

  const {
    model = DEFAULT_MODEL,

    temperature =
      DEFAULT_TEMPERATURE,

    maxOutputTokens =
      DEFAULT_MAX_OUTPUT_TOKENS,
  } = options;

  /*
   * Convert our internal messages
   * into Gemini-compatible roles.
   */
  const history =
    buildChatHistory(
      messages
    );

  const contents = [
    ...history
      .filter(
        (message) =>
          message.role !==
          "system"
      )
      .map((message) => ({
        role:
          message.role,

        parts: [
          {
            text:
              message.content,
          },
        ],
      })),

    {
      role: "user",

      parts: [
        {
          text:
            userMessage.trim(),
        },
      ],
    },
  ];

  const body = {
    contents,

    generationConfig: {
      temperature,

      maxOutputTokens,
    },
  };

  const response =
    await fetch(
      buildEndpoint(
        model,
        apiKey
      ),
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(body),
      }
    );

  const data =
    await parseResponse(
      response
    );

  if (!response.ok) {
    throw createGeminiError(
      response.status,
      data
    );
  }

  return {
    text:
      extractText(data),

    model,

    raw: data,

    metadata: {
      model,

      generatedAt:
        Date.now(),

      usage:
        data.usageMetadata ??
        null,
    },
  };
}

/* =========================================================
   ENDPOINT
   ========================================================= */

/**
 * Build Gemini API endpoint.
 */
function buildEndpoint(
  model,
  apiKey
) {
  return (
    `${GEMINI_API_BASE}/` +
    `${encodeURIComponent(model)}` +
    `:generateContent?key=` +
    `${encodeURIComponent(apiKey)}`
  );
}

/* =========================================================
   RESPONSE
   ========================================================= */

/**
 * Parse JSON response safely.
 */
async function parseResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      rawText: text,
    };
  }
}

/**
 * Extract generated text from
 * Gemini response.
 */
function extractText(
  data
) {
  const candidates =
    data?.candidates;

  if (
    !Array.isArray(
      candidates
    ) ||
    candidates.length === 0
  ) {
    return "";
  }

  const parts =
    candidates[0]?.content
      ?.parts;

  if (
    !Array.isArray(parts)
  ) {
    return "";
  }

  return parts
    .map(
      (part) =>
        typeof part.text ===
        "string"
          ? part.text
          : ""
    )
    .join("")
    .trim();
}

/* =========================================================
   ERRORS
   ========================================================= */

/**
 * Create a readable Gemini error.
 */
function createGeminiError(
  status,
  data
) {
  const apiMessage =
    data?.error?.message;

  const error =
    new Error(
      apiMessage ||
        `Gemini request failed (${status}).`
    );

  error.status =
    status;

  error.code =
    data?.error?.status ??
    null;

  error.provider =
    "gemini";

  return error;
}

/* =========================================================
   MODEL
   ========================================================= */

/**
 * Get default model.
 */
export function getDefaultModel() {
  return DEFAULT_MODEL;
}
