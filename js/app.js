// js/app.js

import { initializeDatabase } from "./memory/database.js";
import { initializeAI } from "./ui/enable-ai.js";
import { initializeAskAI } from "./ui/ask-ai.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Initialize local database
    await initializeDatabase();

    // 2. Initialize AI controls
    initializeAI();

    // 3. Initialize Ask AI
    initializeAskAI();

    console.log("Application initialized successfully.");
  } catch (error) {
    console.error("Application initialization failed:", error);
  }
});
