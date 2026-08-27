// js/memory/retrieval.js

import {
  getAllMemories,
} from "./memories.js";

/**
 * Normalize text for local matching.
 */
function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Convert text into useful keywords.
 */
function tokenize(text = "") {
  return [
    ...new Set(
      normalizeText(text)
        .split(" ")
        .filter(
          (word) => word.length >= 2
        )
    ),
  ];
}

/**
 * Calculate how relevant a memory is
 * to the current query.
 */
function calculateScore(
  memory,
  queryTokens
) {
  const content = normalizeText(
    memory.content
  );

  const memoryTokens =
    tokenize(memory.content);

  if (
    !content ||
    queryTokens.length === 0
  ) {
    return 0;
  }

  let score = 0;

  for (const queryToken of queryTokens) {
    // Exact word match
    if (memoryTokens.includes(queryToken)) {
      score += 3;
      continue;
    }

    // Partial match
    if (content.includes(queryToken)) {
      score += 1;
    }
  }

  /*
   * Importance boost.
   *
   * importance:
   * 1 = low
   * 5 = high
   */
  const importance =
    Number(memory.importance) || 1;

  score += importance * 0.2;

  /*
   * Small recency boost.
   * Newer memories get slightly more priority.
   */
  const updatedAt =
    Number(memory.updatedAt) || 0;

  if (updatedAt > 0) {
    const age =
      Date.now() - updatedAt;

    const days =
      age / (1000 * 60 * 60 * 24);

    if (days < 7) {
      score += 1;
    } else if (days < 30) {
      score += 0.5;
    }
  }

  return score;
}

/**
 * Retrieve memories relevant to a query.
 *
 * @param {string} query
 * @param {Object} options
 * @returns {Promise<Array>}
 */
export async function retrieveMemories(
  query,
  options = {}
) {
  const {
    limit = 5,
    minScore = 1,
    types = null,
  } = options;

  const memories =
    await getAllMemories();

  if (!memories.length) {
    return [];
  }

  const queryTokens =
    tokenize(query);

  let candidates = memories;

  /*
   * Optional memory type filtering.
   *
   * Example:
   * types: ["preference", "fact"]
   */
  if (
    Array.isArray(types) &&
    types.length > 0
  ) {
    candidates =
      candidates.filter(
        (memory) =>
          types.includes(memory.type)
      );
  }

  const scored = candidates
    .map((memory) => ({
      memory,
      score: calculateScore(
        memory,
        queryTokens
      ),
    }))
    .filter(
      (item) =>
        item.score >= minScore
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, limit);

  return scored.map(
    ({ memory, score }) => ({
      ...memory,
      score: Number(
        score.toFixed(2)
      ),
    })
  );
}

/**
 * Retrieve only the memory content.
 *
 * Useful when building an AI prompt.
 *
 * @param {string} query
 * @param {Object} options
 * @returns {Promise<Array<string>>}
 */
export async function retrieveMemoryContext(
  query,
  options = {}
) {
  const memories =
    await retrieveMemories(
      query,
      options
    );

  return memories.map(
    (memory) => memory.content
  );
}

/**
 * Build a formatted memory context
 * for the LLM.
 *
 * @param {string} query
 * @param {Object} options
 * @returns {Promise<string>}
 */
export async function buildMemoryContext(
  query,
  options = {}
) {
  const memories =
    await retrieveMemories(
      query,
      options
    );

  if (!memories.length) {
    return "";
  }

  return memories
    .map(
      (memory, index) =>
        `${index + 1}. ${memory.content}`
    )
    .join("\n");
}

/**
 * Check whether a memory is relevant
 * enough to include in context.
 *
 * @param {Object} memory
 * @param {string} query
 * @param {number} minScore
 * @returns {boolean}
 */
export function isMemoryRelevant(
  memory,
  query,
  minScore = 1
) {
  const queryTokens =
    tokenize(query);

  const score =
    calculateScore(
      memory,
      queryTokens
    );

  return score >= minScore;
}
