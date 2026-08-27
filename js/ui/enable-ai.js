// js/ui/enable-ai.js

import {
  getApiKey,
} from "../storage/api-key.js";

import {
  generateAIResponse,
} from "../ai/gemini.js";

import {
  showError,
  showInfo,
  showSuccess,
} from "./notifications.js";

/* =========================================================
   STATE
   ========================================================= */

let enableButton = null;

let aiEnabled = false;

let isEnabling = false;

/* =========================================================
   INITIALIZATION
   ========================================================= */

export function initializeAI() {
  enableButton =
    document.getElementById(
      "enable-ai-btn"
    );

  if (!enableButton) {
    console.warn(
      "Enable AI button not found."
    );

    return;
  }

  enableButton.addEventListener(
    "click",
    handleEnableAI
  );

  updateUI();
}

/* =========================================================
   ENABLE AI
   ========================================================= */

export async function handleEnableAI() {
  if (
    aiEnabled ||
    isEnabling
  ) {
    return;
  }

  try {
    isEnabling = true;

    updateUI();

    /*
     * 1. Check whether user has
     *    configured their Gemini key.
     */
    const apiKey =
      await getApiKey();

    if (!apiKey) {
      showInfo(
        "Add your Gemini API key first."
      );

      return;
    }

    /*
     * 2. Small test request.
     *
     * This verifies that the key
     * actually works.
     */
    await testGeminiConnection();

    /*
     * 3. Mark AI as enabled.
     */
    aiEnabled = true;

    /*
     * 4. Tell the rest of the UI.
     */
    document.dispatchEvent(
      new CustomEvent(
        "ai:enabled"
      )
    );

    showSuccess(
      "AI enabled successfully."
    );

  } catch (error) {
    console.error(
      "Failed to enable AI:",
      error
    );

    handleEnableError(error);

  } finally {
    isEnabling = false;

    updateUI();
  }
}

/* =========================================================
   GEMINI CONNECTION TEST
   ========================================================= */

async function testGeminiConnection() {
  /*
   * We intentionally use a tiny request.
   *
   * The actual user conversation is NOT
   * sent during AI enable.
   */
  const response =
    await generateAIResponse(
      {
        request: {
          userMessage:
            "Respond with OK.",
        },

        conversation: null,

        messages: [],

        memories: [],

        currentData: null,
      },
      {
        temperature: 0,

        maxOutputTokens: 10,
      }
    );

  if (
    !response ||
    !response.text
  ) {
    throw new Error(
      "AI_CONNECTION_FAILED"
    );
  }
}

/* =========================================================
   DISABLE AI
   ========================================================= */

export function disableAI() {
  if (!aiEnabled) {
    return;
  }

  aiEnabled = false;

  document.dispatchEvent(
    new CustomEvent(
      "ai:disabled"
    )
  );

  updateUI();

  showInfo(
    "AI disabled."
  );
}

/* =========================================================
   STATE
   ========================================================= */

export function isAIEnabled() {
  return aiEnabled;
}

/* =========================================================
   UI
   ========================================================= */

function updateUI() {
  if (!enableButton) {
    return;
  }

  enableButton.dataset.enabled =
    String(aiEnabled);

  enableButton.dataset.loading =
    String(isEnabling);

  enableButton.disabled =
    isEnabling;

  if (isEnabling) {
    enableButton.textContent =
      "Enabling AI…";

    enableButton.setAttribute(
      "aria-busy",
      "true"
    );

    return;
  }

  enableButton.removeAttribute(
    "aria-busy"
  );

  if (aiEnabled) {
    enableButton.textContent =
      "AI Enabled";
  } else {
    enableButton.textContent =
      "Enable AI";
  }
}

/* =========================================================
   ERROR HANDLING
   ========================================================= */

function handleEnableError(
  error
) {
  switch (error?.message) {
    case "API_KEY_MISSING":
      showError(
        "Gemini API key is missing."
      );
      break;

    case "AI_CONNECTION_FAILED":
      showError(
        "Could not connect to Gemini."
      );
      break;

    default:
      showError(
        error?.message ||
          "Unable to enable AI."
      );
  }
}
