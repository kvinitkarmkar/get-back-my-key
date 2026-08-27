// js/utils/helpers.js

/* =========================================================
   ID
   ========================================================= */

/**
 * Generate a unique ID.
 */
export function generateId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    `${Date.now()}-` +
    `${Math.random()
      .toString(36)
      .slice(2)}`
  );
}

/* =========================================================
   STRING
   ========================================================= */

/**
 * Safely trim a value.
 */
export function cleanString(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  return value
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate a string.
 */
export function truncate(
  value,
  maxLength = 100
) {
  const text =
    cleanString(value);

  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return (
    text.slice(
      0,
      Math.max(0, maxLength - 3)
    ) + "..."
  );
}

/* =========================================================
   TIME
   ========================================================= */

/**
 * Current timestamp.
 */
export function now() {
  return Date.now();
}

/**
 * Convert timestamp to ISO string.
 */
export function toISOString(
  timestamp = Date.now()
) {
  return new Date(
    timestamp
  ).toISOString();
}

/**
 * Safely convert a value to timestamp.
 */
export function toTimestamp(
  value
) {
  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(
    timestamp
  )
    ? null
    : timestamp;
}

/* =========================================================
   OBJECT
   ========================================================= */

/**
 * Safely clone serializable data.
 *
 * structuredClone is preferred.
 */
export function cloneData(
  data
) {
  if (
    typeof structuredClone ===
    "function"
  ) {
    return structuredClone(
      data
    );
  }

  return JSON.parse(
    JSON.stringify(data)
  );
}

/**
 * Remove undefined properties.
 */
export function removeUndefined(
  object
) {
  if (
    !object ||
    typeof object !==
      "object"
  ) {
    return object;
  }

  return Object.fromEntries(
    Object.entries(object)
      .filter(
        ([, value]) =>
          value !== undefined
      )
  );
}

/* =========================================================
   JSON
   ========================================================= */

/**
 * Safely parse JSON.
 *
 * Returns fallback instead of throwing.
 */
export function safeJsonParse(
  value,
  fallback = null
) {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  try {
    return JSON.parse(
      value
    );
  } catch {
    return fallback;
  }
}

/**
 * Safely stringify JSON.
 */
export function safeJsonStringify(
  value,
  fallback = ""
) {
  try {
    return JSON.stringify(
      value
    );
  } catch {
    return fallback;
  }
}

/* =========================================================
   DEBOUNCE
   ========================================================= */

/**
 * Debounce a function.
 */
export function debounce(
  callback,
  delay = 300
) {
  let timeoutId = null;

  return function (
    ...args
  ) {
    clearTimeout(
      timeoutId
    );

    timeoutId = setTimeout(
      () => {
        callback.apply(
          this,
          args
        );
      },
      delay
    );
  };
}

/* =========================================================
   ASYNC
   ========================================================= */

/**
 * Wait for a specified amount of time.
 */
export function sleep(
  milliseconds
) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
}

/* =========================================================
   DOM
   ========================================================= */

/**
 * Get an element safely.
 */
export function getElement(
  selector
) {
  return document.querySelector(
    selector
  );
}

/**
 * Create an element with
 * optional class and text.
 */
export function createElement(
  tag,
  options = {}
) {
  const element =
    document.createElement(tag);

  if (options.className) {
    element.className =
      options.className;
  }

  if (
    options.text !==
    undefined
  ) {
    element.textContent =
      options.text;
  }

  return element;
}

/* =========================================================
   ARRAY
   ========================================================= */

/**
 * Return unique array values.
 */
export function unique(
  array
) {
  if (
    !Array.isArray(array)
  ) {
    return [];
  }

  return [
    ...new Set(array),
  ];
}

/**
 * Return the last item of
 * an array.
 */
export function last(
  array
) {
  if (
    !Array.isArray(array) ||
    array.length === 0
  ) {
    return null;
  }

  return array[
    array.length - 1
  ];
}
