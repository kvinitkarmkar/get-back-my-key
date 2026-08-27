// js/app.js
import {initializeDatabase,} from "./memory/database.js";
import {initializeNotifications,} from "./ui/notifications.js";
import {initializeAI,} from "./ui/enable-ai.js";
import {initializeAskAI,} from "./ui/ask-ai.js";
import {initializeChat,} from "./ui/chat.js";

document.addEventListener(
  "DOMContentLoaded",
  async () => {
    try {
      initializeNotifications();

      await initializeDatabase();

      initializeChat();

      initializeAI();

      initializeAskAI();

      console.log(
        "Application initialized successfully."
      );

    } catch (error) {
      console.error(
        "Application initialization failed:",
        error
      );
    }
  }
);
