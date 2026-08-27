// js/ui/enable-ai.js

import {
  hasApiKey,
  getMaskedApiKey,
} from "../storage/api-key.js";

let aiEnabled = false;

let elements = {
  enableButton: null,
  status: null,
  indicator: null,
};

/**
 * Initialize Enable AI UI.
 *
 * Expected HTML:
 *
 * <button id="enable-ai-btn">
 *   Enable AI
 * </button>
 *
 * <span id="ai-status"></span>
 *
 * <span id="ai-indicator"></span>
 */
export function initializeAI() {
  elements.enableButton =
    document.getElementById(
      "enable-ai-btn"
    );

  elements.status =
    document.getElementById(
      "ai-status"
    );

  elements.indicator =
    document.getElementById(
      "ai-indicator"
    );

  if (!elements.enableButton) {
    console.warn(
      "Enable AI button not found."
    );

    return;
  }

  elements.enableButton.addEventListener(
    "click",
    handleEnableAI
  );

  // Restore AI state when page loads.
  restoreAIState();
}

/**
 * Handle Enable AI button click.
 */
async function handleEnableAI() {
  setLoadingState();

  try {
    const configured =
      await hasApiKey();

    if (!configured) {
      setNotConfiguredState();

      showMessage(
        "Add your Gemini API key to enable AI."
      );

      return;
    }

    /*
     * The API key already exists locally.
     *
     * No request is sent to our backend.
     */
    setEnabledState();

  } catch (error) {
    console.error(
      "Failed to enable AI:",
      error
    );

    setErrorState();

    showMessage(
      "Unable to enable AI."
    );
  }
}

/**
 * Restore AI state from local storage.
 */
async function restoreAIState() {
  try {
    const configured =
      await hasApiKey();

    if (configured) {
      setEnabledState();
    } else {
      setNotConfiguredState();
    }
  } catch (error) {
    console.error(
      "Failed to restore AI state:",
      error
    );

    setNotConfiguredState();
  }
}

/**
 * Set loading state.
 */
function setLoadingState() {
  aiEnabled = false;

  if (elements.enableButton) {
    elements.enableButton.disabled =
      true;

    elements.enableButton.textContent =
      "Enabling AI...";
  }

  if (elements.status) {
    elements.status.textContent =
      "Checking AI configuration...";
  }

  if (elements.indicator) {
    elements.indicator.textContent =
      "●";
    elements.indicator.className =
      "ai-indicator loading";
  }
}

/**
 * Set enabled state.
 */
async function setEnabledState() {
  aiEnabled = true;

  if (elements.enableButton) {
    elements.enableButton.disabled =
      false;

    elements.enableButton.textContent =
      "✓ AI Enabled";
  }

  if (elements.status) {
    const maskedKey =
      await getMaskedApiKey();

    elements.status.textContent =
      maskedKey
        ? `AI is ready · ${maskedKey}`
        : "AI is ready";
  }

  if (elements.indicator) {
    elements.indicator.textContent =
      "●";

    elements.indicator.className =
      "ai-indicator enabled";
  }

  document.dispatchEvent(
    new CustomEvent(
      "ai:enabled"
    )
  );
}

/**
 * Set not-configured state.
 */
function setNotConfiguredState() {
  aiEnabled = false;

  if (elements.enableButton) {
    elements.enableButton.disabled =
      false;

    elements.enableButton.textContent =
      "Enable AI";
  }

  if (elements.status) {
    elements.status.textContent =
      "AI is not configured";
  }

  if (elements.indicator) {
    elements.indicator.textContent =
      "●";

    elements.indicator.className =
      "ai-indicator disabled";
  }

  document.dispatchEvent(
    new CustomEvent(
      "ai:not-configured"
    )
  );
}

/**
 * Set error state.
 */
function setErrorState() {
  aiEnabled = false;

  if (elements.enableButton) {
    elements.enableButton.disabled =
      false;

    elements.enableButton.textContent =
      "Enable AI";
  }

  if (elements.status) {
    elements.status.textContent =
      "AI unavailable";
  }

  if (elements.indicator) {
    elements.indicator.textContent =
      "●";

    elements.indicator.className =
      "ai-indicator error";
  }
}

/**
 * Check whether AI is currently enabled.
 *
 * @returns {boolean}
 */
export function isAIEnabled() {
  return aiEnabled;
}

/**
 * Show a temporary UI message.
 */
function showMessage(message) {
  console.info(
    `[AI] ${message}`
  );

  document.dispatchEvent(
    new CustomEvent(
      "ai:message",
      {
        detail: {
          message,
        },
      }
    )
  );
}

/**
 * Manually refresh AI state.
 *
 * Useful after saving/removing
 * an API key.
 */
export async function refreshAIState() {
  await restoreAIState();
}
