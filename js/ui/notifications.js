// js/ui/notifications.js

let container = null;

const DEFAULT_DURATION = 3500;

/**
 * Initialize the notification system.
 *
 * Creates the notification container automatically,
 * so no notification HTML is required.
 */
export function initializeNotifications() {
  if (container) {
    return;
  }

  container =
    document.createElement("div");

  container.id =
    "notification-container";

  container.setAttribute(
    "aria-live",
    "polite"
  );

  container.setAttribute(
    "aria-atomic",
    "true"
  );

  document.body.appendChild(
    container
  );
}

/**
 * Show a notification.
 *
 * @param {string} message
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function showNotification(
  message,
  options = {}
) {
  if (!container) {
    initializeNotifications();
  }

  const {
    type = "info",
    duration = DEFAULT_DURATION,
  } = options;

  const notification =
    document.createElement("div");

  notification.className =
    `notification notification-${type}`;

  notification.setAttribute(
    "role",
    type === "error"
      ? "alert"
      : "status"
  );

  /*
   * Notification content
   */
  const content =
    document.createElement("span");

  content.className =
    "notification-message";

  content.textContent = message;

  /*
   * Close button
   */
  const closeButton =
    document.createElement("button");

  closeButton.className =
    "notification-close";

  closeButton.type = "button";

  closeButton.setAttribute(
    "aria-label",
    "Close notification"
  );

  closeButton.textContent = "×";

  closeButton.addEventListener(
    "click",
    () => {
      removeNotification(
        notification
      );
    }
  );

  notification.appendChild(
    content
  );

  notification.appendChild(
    closeButton
  );

  container.appendChild(
    notification
  );

  /*
   * Trigger entrance animation
   * after the element is added.
   */
  requestAnimationFrame(() => {
    notification.classList.add(
      "notification-visible"
    );
  });

  /*
   * Auto remove.
   */
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(
        notification
      );
    }, duration);
  }

  return notification;
}

/**
 * Show success notification.
 */
export function showSuccess(
  message,
  duration
) {
  return showNotification(
    message,
    {
      type: "success",
      duration,
    }
  );
}

/**
 * Show error notification.
 */
export function showError(
  message,
  duration
) {
  return showNotification(
    message,
    {
      type: "error",
      duration,
    }
  );
}

/**
 * Show warning notification.
 */
export function showWarning(
  message,
  duration
) {
  return showNotification(
    message,
    {
      type: "warning",
      duration,
    }
  );
}

/**
 * Show information notification.
 */
export function showInfo(
  message,
  duration
) {
  return showNotification(
    message,
    {
      type: "info",
      duration,
    }
  );
}

/**
 * Remove a notification.
 *
 * @param {HTMLElement} notification
 */
export function removeNotification(
  notification
) {
  if (!notification) {
    return;
  }

  notification.classList.remove(
    "notification-visible"
  );

  /*
   * Wait for exit animation.
   */
  setTimeout(() => {
    notification.remove();
  }, 200);
}

/**
 * Remove all notifications.
 */
export function clearNotifications() {
  if (!container) {
    return;
  }

  const notifications =
    container.querySelectorAll(
      ".notification"
    );

  notifications.forEach(
    (notification) => {
      removeNotification(
        notification
      );
    }
  );
}
