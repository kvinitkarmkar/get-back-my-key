// js/ui/chat.js

import {
  createConversation,
  getConversation,
  getAllConversations,
  renameConversation,
} from "../memory/conversations.js";

let elements = {
  chatContainer: null,
  input: null,
  sendButton: null,
  conversationList: null,
  newChatButton: null,
};

let currentConversationId = null;

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
  if (elements.newChatButton) {
    elements.newChatButton.addEventListener(
      "click",
      handleNewConversation
    );
  }

  /*
   * User message submission.
   */
  if (elements.sendButton) {
    elements.sendButton.addEventListener(
      "click",
      handleSendMessage
    );
  }

  /*
   * Ctrl/Cmd + Enter to send.
   */
  if (elements.input) {
    elements.input.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" &&
          (event.ctrlKey ||
            event.metaKey)
        ) {
          event.preventDefault();

          handleSendMessage();
        }
      }
    );
  }

  /*
   * AI response event.
   */
  document.addEventListener(
    "ai:response",
    handleAIResponse
  );

  /*
   * Load existing conversations.
   */
  await loadConversations();
}

/**
 * Create a new conversation.
 */
async function handleNewConversation() {
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
  }
}

/**
 * Handle user sending a message.
 *
 * Actual message persistence will be
 * connected when conversation message
 * operations are implemented.
 */
async function handleSendMessage() {
  if (!elements.input) {
    return;
  }

  const content =
    elements.input.value.trim();

  if (!content) {
    return;
  }

  /*
   * Create conversation automatically
   * if one doesn't exist.
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
   * Display user message immediately.
   */
  appendMessage({
    role: "user",
    content,
  });

  /*
   * Clear input.
   */
  elements.input.value = "";

  /*
   * Notify other modules that a new
   * user message was created.
   */
  document.dispatchEvent(
    new CustomEvent(
      "chat:user-message",
      {
        detail: {
          conversationId:
            currentConversationId,

          content,
        },
      }
    )
  );
}

/**
 * Handle AI response.
 */
function handleAIResponse(event) {
  const response =
    event.detail?.response;

  if (!response) {
    return;
  }

  appendMessage({
    role: "assistant",
    content:
      extractResponseText(
        response
      ),
  });
}

/**
 * Add a message to the chat UI.
 */
export function appendMessage({
  role,
  content,
}) {
  if (!elements.chatContainer) {
    return;
  }

  const message =
    document.createElement("div");

  message.className =
    `chat-message chat-message-${role}`;

  const contentElement =
    document.createElement("div");

  contentElement.className =
    "chat-message-content";

  /*
   * textContent prevents HTML injection.
   */
  contentElement.textContent =
    content;

  message.appendChild(
    contentElement
  );

  elements.chatContainer.appendChild(
    message
  );

  scrollToBottom();

  return message;
}

/**
 * Clear current chat UI.
 */
export function clearChat() {
  if (!elements.chatContainer) {
    return;
  }

  elements.chatContainer.innerHTML = "";
}

/**
 * Get currently active conversation ID.
 */
export function getCurrentConversationId() {
  return currentConversationId;
}

/**
 * Switch conversation.
 *
 * Message loading will be connected to
 * conversation storage later.
 */
export async function switchConversation(
  conversationId
) {
  const conversation =
    await getConversation(
      conversationId
    );

  if (!conversation) {
    console.warn(
      "Conversation not found:",
      conversationId
    );

    return;
  }

  currentConversationId =
    conversationId;

  clearChat();

  /*
   * Later:
   * load messages for this conversation
   * and render them here.
   */

  focusInput();
}

/**
 * Render conversation sidebar.
 */
async function loadConversations() {
  if (!elements.conversationList) {
    return;
  }

  const conversations =
    await getAllConversations();

  elements.conversationList.innerHTML =
    "";

  for (
    const conversation of conversations
  ) {
    const item =
      document.createElement("button");

    item.type = "button";

    item.className =
      "conversation-item";

    item.dataset.id =
      conversation.id;

    item.textContent =
      conversation.title;

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
}

/**
 * Generate a basic title from
 * the first user message.
 */
function generateConversationTitle(
  content
) {
  const maxLength = 40;

  if (content.length <= maxLength) {
    return content;
  }

  return (
    content.slice(0, maxLength) +
    "..."
  );
}

/**
 * Extract text from the response.
 *
 * Supports both plain string
 * and structured responses.
 */
function extractResponseText(
  response
) {
  if (typeof response === "string") {
    return response;
  }

  if (
    response?.text &&
    typeof response.text === "string"
  ) {
    return response.text;
  }

  if (
    response?.content &&
    typeof response.content === "string"
  ) {
    return response.content;
  }

  return JSON.stringify(
    response,
    null,
    2
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
 * Focus chat input.
 */
function focusInput() {
  elements.input?.focus();
}
