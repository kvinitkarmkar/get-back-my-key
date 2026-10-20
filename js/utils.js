
/* ============================================================
   ID
============================================================ */

function createId() {

  if (
    window.crypto &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );

}


/* ============================================================
   HAPTIC
============================================================ */

function triggerHaptic() {

  if (
    "vibrate" in navigator &&
    typeof navigator.vibrate === "function"
  ) {

    try {
      navigator.vibrate([35, 25, 55]);
    } catch (_) {}

  }

}


/* ============================================================
   DATE
============================================================ */

function formatDate(timestamp) {

  const date =
    new Date(timestamp);


  const now =
    new Date();


  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();


  if (sameDay) {

    return date.toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short"
    }
  );

}

