// js/ui/ask-ai.js

import {
  buildAIContext,
} from "../ai/context.js";

import {
  generateAIResponse,
} from "../ai/gemini.js";

import {
  normalizeResponse,
} from "../ai/response.js";

import {
  getCurrentConversationId,
} from "./chat.js";

import {
  showError,
  showInfo,
} from "./notifications.js";

/* =========================================================
   STATE
   ========================================================= */

let askAIButton = null;

let isGenerating = false;

/*
 * Optional provider for current application data.
 *
 * Another part of the application can register
 * a function here.
 */
let currentDataProvider = null;

/* =========================================================
   INITIALIZATION
   ========================================================= */

/**
 * Initialize Ask AI functionality.
 *
 * Expected HTML:
 *
 * <button id="ask-ai-btn">
 *   Ask AI
 * </button>
 */
export function initializeAskAI() {
  askAIButton =
    document.getElementById(
      "ask-ai-btn"
    );

  if (!askAIButton) {
    console.warn(
      "Ask AI button not found."
    );

    return;
  }

  askAIButton.addEventListener(
    "click",
    handleAskAI
  );

  updateButtonState();
}

/* =========================================================
   ASK AI
   ========================================================= */

/**
 * Handle Ask AI button click.
 */
export async function handleAskAI() {
  if (isGenerating) {
    return;
  }

  /*
   * Make sure AI is enabled.
   *
   * enable-ai.js can expose the current
   * AI state through this event/state.
   */
  if (!isAIEnabled()) {
    showInfo(
      "Please enable AI first."
    );

    return;
  }

  /*
   * Get current conversation.
   */
  const conversationId =
    getCurrentConversationId();

  if (!conversationId) {
    showInfo(
      "Start a conversation first."
    );

    return;
  }

  /*
   * The context layer needs the current
   * user request.
   *
   * We use the latest user message from
   * the chat context.
   */
  const userMessage =
    getCurrentUserRequest();

  if (!userMessage) {
    showInfo(
      "Write a message first."
    );

    return;
  }

  try {
    isGenerating = true;

    setLoadingState(true);

    /*
     * Get current application/page data.
     */
    const currentData =
      await getCurrentData();

    /*
     * Build memory + conversation context.
     */
    const context =
      await buildAIContext({
        conversationId,

        userMessage,

        currentData,
      });

    /*
     * Call Gemini.
     */
    const rawResponse =
      await generateAIResponse(
        context
      );

    /*
     * Normalize provider response.
     */
    const response =
      normalizeResponse(
        rawResponse
      );

    /*
     * Send response to chat.js.
     *
     * chat.js will:
     * - save it to IndexedDB
     * - render it
     */
    document.dispatchEvent(
      new CustomEvent(
        "ai:response",
        {
          detail: {
            response,
            conversationId,
          },
        }
      )
    );

    return response;

  } catch (error) {
    console.error(
      "Ask AI failed:",
      error
    );

    handleAIError(error);

  } finally {
    isGenerating = false;

    setLoadingState(false);
  }
}

/* =========================================================
   CURRENT DATA
   ========================================================= */

/**
 * Register a provider that returns the
 * current application data.
 *
 * Example:
 *
 * registerCurrentDataProvider(
 *   () => getCurrentFormData()
 * );
 */
export function registerCurrentDataProvider(
  provider
) {
  if (
    typeof provider !==
    "function"
  ) {
    throw new Error(
      "Current data provider must be a function."
    );
  }

  currentDataProvider =
    provider;
}

/**
 * Get current application data.
 */
async function getCurrentData() {
  if (
    typeof currentDataProvider !==
    "function"
  ) {
    return null;
  }

  try {
    const data =
      await currentDataProvider();

    return data ?? null;

  } catch (error) {
    console.error(
      "Failed to get current data:",
      error
    );

    return null;
  }
}

/* =========================================================
   CURRENT USER REQUEST
   ========================================================= */

/**
 * Get the latest user message from
 * the active chat.
 *
 * We listen to the same message event
 * emitted by chat.js.
 */
let latestUserMessage = "";

document.addEventListener(
  "chat:user-message",
  (event) => {
    const message =
      event.detail?.message;

    if (
      message?.role ===
      "user"
    ) {
      latestUserMessage =
        message.content;
    }
  }
);

/**
 * Return latest user request.
 */
function getCurrentUserRequest() {
  return latestUserMessage.trim();
}

/* =========================================================
   AI STATE
   ========================================================= */

/**
 * Determine whether AI is enabled.
 *
 * enable-ai.js should dispatch:
 *
 * ai:enabled
 *
 * when AI becomes enabled.
 */
let aiEnabled = false;

document.addEventListener(
  "ai:enabled",
  () => {
    aiEnabled = true;

    updateButtonState();
  }
);

document.addEventListener(
  "ai:disabled",
  () => {
    aiEnabled = false;

    updateButtonState();
  }
);

function isAIEnabled() {
  return aiEnabled;
}

/**
 * Allow other modules to set AI state
 * directly if needed.
 */
export function setAIEnabled(
  enabled
) {
  aiEnabled =
    Boolean(enabled);

  updateButtonState();
}

/**
 * Get current AI state.
 */
export function isAIActive() {
  return aiEnabled;
}

/* =========================================================
   BUTTON UI
   ========================================================= */

/**
 * Update Ask AI button.
 */
function updateButtonState() {
  if (!askAIButton) {
    return;
  }

  askAIButton.disabled =
    isGenerating;

  askAIButton.dataset.enabled =
    String(aiEnabled);

  if (!aiEnabled) {
    askAIButton.setAttribute(
      "aria-disabled",
      "true"
    );
  } else {
    askAIButton.removeAttribute(
      "aria-disabled"
    );
  }
}

/**
 * Loading state.
 */
function setLoadingState(
  loading
) {
  if (!askAIButton) {
    return;
  }

  if (loading) {
    askAIButton.disabled =
      true;

    askAIButton.dataset.loading =
      "true";

    askAIButton.setAttribute(
      "aria-busy",
      "true"
    );

    /*
     * Don't permanently replace the
     * original text.
     */
    if (
      !askAIButton.dataset
        .originalText
    ) {
      askAIButton.dataset
        .originalText =
        askAIButton.textContent;
    }

    askAIButton.textContent =
      "Thinking…";

  } else {
    askAIButton.disabled =
      false;

    delete askAIButton.dataset
      .loading;

    askAIButton.removeAttribute(
      "aria-busy"
    );

    askAIButton.textContent =
      askAIButton.dataset
        .originalText ||
      "Ask AI";
  }
}

/* =========================================================
   ERROR HANDLING
   ========================================================= */

/**
 * Handle known AI errors.
 */
function handleAIError(
  error
) {
  switch (error?.message) {
    case "API_KEY_MISSING":
      showError(
        "Gemini API key is not configured."
      );
      break;

    case "USER_MESSAGE_REQUIRED":
      showError(
        "Please enter a message."
      );
      break;

    default:
      showError(
        error?.message ||
          "Something went wrong while contacting AI."
      );
  }
}

/* =========================================================
   PUBLIC HELPERS
   ========================================================= */

/**
 * Check whether an AI request is
 * currently running.
 */
export function isAIRequestRunning() {
  return isGenerating;
}

/**
 * Reset latest user message.
 */
export function resetAIRequestState() {
  latestUserMessage = "";
}
