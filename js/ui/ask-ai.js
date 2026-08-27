// js/ui/ask-ai.js

import {
  isAIEnabled,
} from "./enable-ai.js";

import {
  showError,
  showInfo,
} from "./notifications.js";

import {
  buildAIContext,
} from "../ai/context.js";

import {
  generateAIResponse,
} from "../ai/gemini.js";

let askButton = null;
let isProcessing = false;

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
  askButton =
    document.getElementById(
      "ask-ai-btn"
    );

  if (!askButton) {
    console.warn(
      "Ask AI button not found."
    );

    return;
  }

  askButton.addEventListener(
    "click",
    handleAskAI
  );

  updateButtonState();
}

/**
 * Handle Ask AI button.
 */
async function handleAskAI() {
  if (isProcessing) {
    return;
  }

  if (!isAIEnabled()) {
    showInfo(
      "Please enable AI first."
    );

    return;
  }

  try {
    isProcessing = true;

    setLoadingState();

    /*
     * Build the complete context.
     *
     * This will eventually contain:
     *
     * - Current user data
     * - Recent conversation
     * - Relevant memories
     */
    const context =
      await buildAIContext();

    /*
     * Send context to Gemini.
     */
    const response =
      await generateAIResponse(
        context
      );

    /*
     * Send the response to the chat UI.
     */
    dispatchAIResponse(
      response
    );

  } catch (error) {
    console.error(
      "Ask AI failed:",
      error
    );

    showError(
      getReadableError(error)
    );

  } finally {
    isProcessing = false;

    setReadyState();
  }
}

/**
 * Set loading UI.
 */
function setLoadingState() {
  if (!askButton) {
    return;
  }

  askButton.disabled = true;

  askButton.dataset.loading =
    "true";

  askButton.textContent =
    "Thinking...";
}

/**
 * Restore normal button UI.
 */
function setReadyState() {
  if (!askButton) {
    return;
  }

  askButton.disabled = false;

  delete askButton.dataset.loading;

  askButton.textContent =
    "Ask AI";
}

/**
 * Update button according to
 * current AI state.
 */
function updateButtonState() {
  if (!askButton) {
    return;
  }

  askButton.disabled =
    !isAIEnabled();
}

/**
 * Send AI response to chat UI
 * through a custom event.
 */
function dispatchAIResponse(
  response
) {
  document.dispatchEvent(
    new CustomEvent(
      "ai:response",
      {
        detail: {
          response,
        },
      }
    )
  );
}

/**
 * Convert technical errors into
 * user-friendly messages.
 */
function getReadableError(
  error
) {
  if (!error) {
    return "Something went wrong.";
  }

  if (
    error.message?.includes(
      "API_KEY"
    )
  ) {
    return "Your Gemini API key is invalid or missing.";
  }

  if (
    error.message?.includes(
      "429"
    )
  ) {
    return "AI request limit reached. Please try again later.";
  }

  if (
    error.message?.includes(
      "network"
    )
  ) {
    return "Network error. Please check your internet connection.";
  }

  return (
    error.message ||
    "Unable to get a response from AI."
  );
}

/**
 * Manually refresh the Ask AI button.
 *
 * Call this after AI is enabled/disabled.
 */
export function refreshAskAIState() {
  updateButtonState();
}
