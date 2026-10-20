
/* ============================================================
   LOCAL STORAGE
============================================================ */

function saveData() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(passwords)
  );

}


function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      passwords = [];
      return;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      passwords = [];
      return;
    }

    passwords = parsed
      .filter(item =>
        item &&
        typeof item.text === "string" &&
        ["pending", "failed", "success"].includes(item.status)
      )
      .map(item => ({
        id:
          typeof item.id === "string"
            ? item.id
            : createId(),

        text: item.text,

        status: item.status,

        createdAt:
          Number.isFinite(item.createdAt)
            ? item.createdAt
            : Date.now()
      }));

  } catch (error) {

    console.error(
      "Unable to load local data:",
      error
    );

    passwords = [];

  }

}

