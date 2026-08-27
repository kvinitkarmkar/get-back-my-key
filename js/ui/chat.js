// js/ui/chat.js

import {
  createConversation,
  getConversation,
  getAllConversations,
  renameConversation,
  deleteConversation,
  addMessage,
  getMessages,
} from "../memory/conversations.js";

import {
  showError,
} from "./notifications.js";

let elements = {
  chatContainer: null,
  input: null,
  sendButton: null,
  conversationList: null,
  newChatButton: null,
};

let currentConversationId = null;
let isSending = false;

/* =========================================================
   INITIALIZATION
   ========================================================= */

/**
 * Initialize chat UI.
 *
 * Expected HTML:
 *
 * <div id="conversation-list"></div>
 *
 * <button id="new-chat-btn">
 *   New Chat
 * </button>
 *
 * <div id="chat-container"></div>
 *
 * <textarea id="chat-input"></textarea>
 *
 * <button id="send-message-btn">
 *   Send
 * </button>
 */
export async function initializeChat() {
  elements.chatContainer =
    document.getElementById(
      "chat-container"
    );

  elements.input =
    document.getElementById(
      "chat-input"
    );

  elements.sendButton =
    document.getElementById(
      "send-message-btn"
    );

  elements.conversationList =
    document.getElementById(
      "conversation-list"
    );

  elements.newChatButton =
    document.getElementById(
      "new-chat-btn"
    );

  /*
   * New conversation
   */
  elements.newChatButton?.addEventListener(
    "click",
    handleNewConversation
  );

  /*
   * Send message
   */
  elements.sendButton?.addEventListener(
    "click",
    handleSendMessage
  );

  /*
   * Ctrl/Cmd + Enter
   */
  elements.input?.addEventListener(
    "keydown",
    handleInputKeydown
  );

  /*
   * AI response
   */
  document.addEventListener(
    "ai:response",
    handleAIResponse
  );

  /*
   * Load conversations.
   */
  await loadConversations();

  /*
   * Restore the latest conversation.
   */
  const conversations =
    await getAllConversations();

  if (conversations.length > 0) {
    await switchConversation(
      conversations[0].id
    );
  }
}

/* =========================================================
   NEW CONVERSATION
   ========================================================= */

/**
 * Create a new conversation.
 */
export async function handleNewConversation() {
  try {
    const conversation =
      await createConversation({
        title: "New conversation",
      });

    currentConversationId =
      conversation.id;

    clearChat();

    await loadConversations();

    focusInput();

  } catch (error) {
    console.error(
      "Failed to create conversation:",
      error
    );

    showError(
      "Unable to create a new conversation."
    );
  }
}

/* =========================================================
   SEND MESSAGE
   ========================================================= */

/**
 * Handle user message submission.
 */
async function handleSendMessage() {
  if (isSending) {
    return;
  }

  const content =
    elements.input?.value.trim();

  if (!content) {
    return;
  }

  try {
    isSending = true;

    setSendLoadingState();

    /*
     * Automatically create a conversation
     * if there is no active one.
     */
    if (!currentConversationId) {
      const conversation =
        await createConversation({
          title:
            generateConversationTitle(
              content
            ),
        });

      currentConversationId =
        conversation.id;

      await loadConversations();
    }

    /*
     * Save user message.
     */
    const message =
      await addMessage(
        currentConversationId,
        {
          role: "user",
          content,
        }
      );

    /*
     * Render immediately.
     */
    appendMessage(message);

    /*
     * Clear input.
     */
    elements.input.value = "";

    /*
     * Automatically set conversation
     * title from first user message.
     */
    await updateTitleIfNeeded(
      content
    );

    /*
     * Notify AI layer.
     *
     * ask-ai.js/context.js can listen
     * to this event.
     */
    document.dispatchEvent(
      new CustomEvent(
        "chat:user-message",
        {
          detail: {
            conversationId:
              currentConversationId,

            message,
          },
        }
      )
    );

  } catch (error) {
    console.error(
      "Failed to send message:",
      error
    );

    showError(
      "Unable to save your message."
    );

  } finally {
    isSending = false;

    setSendReadyState();

    focusInput();
  }
}

/* =========================================================
   AI RESPONSE
   ========================================================= */

/**
 * Handle response received from AI.
 */
async function handleAIResponse(
  event
) {
  const response =
    event.detail?.response;

  if (!response) {
    return;
  }

  if (!currentConversationId) {
    console.warn(
      "AI response received without an active conversation."
    );

    return;
  }

  try {
    const content =
      extractResponseText(
        response
      );

    if (!content) {
      return;
    }

    /*
     * Save AI response.
     */
    const message =
      await addMessage(
        currentConversationId,
        {
          role: "assistant",
          content,

          metadata:
            typeof response ===
            "object"
              ? response.metadata ??
                null
              : null,
        }
      );

    /*
     * Render AI response.
     */
    appendMessage(message);

  } catch (error) {
    console.error(
      "Failed to save AI response:",
      error
    );

    showError(
      "Unable to save AI response."
    );
  }
}

/* =========================================================
   LOAD CONVERSATIONS
   ========================================================= */

/**
 * Load conversation sidebar.
 */
async function loadConversations() {
  if (!elements.conversationList) {
    return;
  }

  try {
    const conversations =
      await getAllConversations();

    elements.conversationList.innerHTML =
      "";

    for (
      const conversation of conversations
    ) {
      const item =
        document.createElement(
          "button"
        );

      item.type = "button";

      item.className =
        "conversation-item";

      item.dataset.id =
        conversation.id;

      item.textContent =
        conversation.title;

      if (
        conversation.id ===
        currentConversationId
      ) {
        item.classList.add(
          "active"
        );
      }

      item.addEventListener(
        "click",
        () =>
          switchConversation(
            conversation.id
          )
      );

      elements.conversationList.appendChild(
        item
      );
    }
  } catch (error) {
    console.error(
      "Failed to load conversations:",
      error
    );
  }
}

/* =========================================================
   SWITCH CONVERSATION
   ========================================================= */

/**
 * Switch to an existing conversation.
 *
 * @param {string} conversationId
 */
export async function switchConversation(
  conversationId
) {
  try {
    const conversation =
      await getConversation(
        conversationId
      );

    if (!conversation) {
      showError(
        "Conversation not found."
      );

      return;
    }

    currentConversationId =
      conversationId;

    clearChat();

    /*
     * Load all messages for this
     * conversation.
     */
    const messages =
      await getMessages(
        conversationId
      );

    /*
     * Render messages in chronological
     * order.
     */
    for (const message of messages) {
      appendMessage(message);
    }

    await loadConversations();

    focusInput();

  } catch (error) {
    console.error(
      "Failed to switch conversation:",
      error
    );

    showError(
      "Unable to open conversation."
    );
  }
}

/* =========================================================
   RENDER MESSAGE
   ========================================================= */

/**
 * Render a message in the chat UI.
 *
 * @param {Object} message
 */
export function appendMessage(
  message
) {
  if (!elements.chatContainer) {
    return null;
  }

  const {
    role,
    content,
  } = message;

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    `chat-message chat-message-${role}`;

  wrapper.dataset.messageId =
    message.id ?? "";

  const contentElement =
    document.createElement(
      "div"
    );

  contentElement.className =
    "chat-message-content";

  /*
   * textContent is intentional.
   * It prevents user/AI generated HTML
   * from being interpreted as markup.
   */
  contentElement.textContent =
    content;

  wrapper.appendChild(
    contentElement
  );

  elements.chatContainer.appendChild(
    wrapper
  );

  scrollToBottom();

  return wrapper;
}

/* =========================================================
   DELETE CONVERSATION
   ========================================================= */

/**
 * Delete current conversation.
 *
 * @param {string} conversationId
 */
export async function removeConversation(
  conversationId
) {
  try {
    const deleted =
      await deleteConversation(
        conversationId
      );

    if (!deleted) {
      return false;
    }

    /*
     * If currently open conversation
     * was deleted, create a fresh state.
     */
    if (
      conversationId ===
      currentConversationId
    ) {
      currentConversationId =
        null;

      clearChat();

      const conversations =
        await getAllConversations();

      if (conversations.length > 0) {
        await switchConversation(
          conversations[0].id
        );
      }
    }

    await loadConversations();

    return true;

  } catch (error) {
    console.error(
      "Failed to delete conversation:",
      error
    );

    showError(
      "Unable to delete conversation."
    );

    return false;
  }
}

/* =========================================================
   RENAME
   ========================================================= */

/**
 * Rename a conversation.
 *
 * @param {string} conversationId
 * @param {string} title
 */
export async function renameChat(
  conversationId,
  title
) {
  try {
    await renameConversation(
      conversationId,
      title
    );

    await loadConversations();

  } catch (error) {
    console.error(
      "Failed to rename conversation:",
      error
    );

    showError(
      "Unable to rename conversation."
    );
  }
}

/* =========================================================
   AUTO TITLE
   ========================================================= */

/**
 * Update title from first user message.
 */
async function updateTitleIfNeeded(
  content
) {
  if (!currentConversationId) {
    return;
  }

  const conversation =
    await getConversation(
      currentConversationId
    );

  if (!conversation) {
    return;
  }

  /*
   * Only auto-title a new conversation.
   */
  if (
    conversation.title !==
    "New conversation"
  ) {
    return;
  }

  const title =
    generateConversationTitle(
      content
    );

  await renameConversation(
    currentConversationId,
    title
  );

  await loadConversations();
}

/**
 * Generate a simple title from
 * the first user message.
 */
function generateConversationTitle(
  content
) {
  const clean =
    content
      .replace(/\s+/g, " ")
      .trim();

  const maxLength = 45;

  if (clean.length <= maxLength) {
    return clean;
  }

  return (
    clean.slice(0, maxLength) +
    "..."
  );
}

/* =========================================================
   INPUT / BUTTON STATE
   ========================================================= */

/**
 * Handle keyboard input.
 */
function handleInputKeydown(
  event
) {
  if (
    event.key === "Enter" &&
    (event.ctrlKey ||
      event.metaKey)
  ) {
    event.preventDefault();

    handleSendMessage();
  }
}

/**
 * Send button loading state.
 */
function setSendLoadingState() {
  if (!elements.sendButton) {
    return;
  }

  elements.sendButton.disabled =
    true;

  elements.sendButton.dataset.loading =
    "true";
}

/**
 * Restore send button state.
 */
function setSendReadyState() {
  if (!elements.sendButton) {
    return;
  }

  elements.sendButton.disabled =
    false;

  delete elements.sendButton.dataset
    .loading;
}

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Clear chat UI.
 */
export function clearChat() {
  if (!elements.chatContainer) {
    return;
  }

  elements.chatContainer.innerHTML =
    "";
}

/**
 * Get current conversation ID.
 */
export function getCurrentConversationId() {
  return currentConversationId;
}

/**
 * Get current conversation.
 */
export async function getCurrentConversation() {
  if (!currentConversationId) {
    return null;
  }

  return getConversation(
    currentConversationId
  );
}

/**
 * Scroll chat to bottom.
 */
function scrollToBottom() {
  if (!elements.chatContainer) {
    return;
  }

  elements.chatContainer.scrollTop =
    elements.chatContainer.scrollHeight;
}

/**
 * Focus input.
 */
function focusInput() {
  elements.input?.focus();
}

/**
 * Extract plain text from an AI
 * response or structured response.
 */
function extractResponseText(
  response
) {
  if (
    typeof response ===
    "string"
  ) {
    return response;
  }

  if (
    response?.text &&
    typeof response.text ===
      "string"
  ) {
    return response.text;
  }

  if (
    response?.content &&
    typeof response.content ===
      "string"
  ) {
    return response.content;
  }

  if (
    response?.message &&
    typeof response.message ===
      "string"
  ) {
    return response.message;
  }

  return JSON.stringify(
    response,
    null,
    2
  );
}
