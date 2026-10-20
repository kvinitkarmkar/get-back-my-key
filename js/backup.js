
/* ============================================================
   EXPORT BACKUP
============================================================ */

exportButton.addEventListener(
  "click",
  exportBackup
);


function exportBackup() {

  if (passwords.length === 0) {

    showToast(
      "There is no data to export.",
      "error"
    );

    return;
  }


  const backup = {

    app:
      "Get Back My Key",

    version:
      1,

    exportedAt:
      new Date().toISOString(),

    attempts:
      passwords

  };


  const blob =
    new Blob(
      [
        JSON.stringify(
          backup,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const anchor =
    document.createElement("a");


  anchor.href =
    url;

  anchor.download =
    `get-back-my-key-backup-${dateForFilename()}.json`;


  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "Backup exported successfully.",
    "success"
  );

}


function dateForFilename() {

  const date =
    new Date();

  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(2, "0"),

    String(
      date.getDate()
    ).padStart(2, "0")
  ].join("-");

}


/* ============================================================
   IMPORT BACKUP
============================================================ */

importButton.addEventListener(
  "click",
  () => {
    fileInput.click();
  }
);


fileInput.addEventListener(
  "change",
  async () => {

    const file =
      fileInput.files[0];


    if (!file) {
      return;
    }


    try {

      const text =
        await file.text();


      const parsed =
        JSON.parse(text);


      let imported;


      if (
        Array.isArray(parsed)
      ) {

        imported =
          parsed;

      } else if (
        parsed &&
        Array.isArray(
          parsed.attempts
        )
      ) {

        imported =
          parsed.attempts;

      } else {

        throw new Error(
          "Invalid backup format."
        );

      }


      const clean =
        imported
          .filter(item =>
            item &&
            typeof item.text === "string" &&
            ["pending", "failed", "success"].includes(
              item.status
            )
          )
          .map(item => ({
            id: createId(),

            text: item.text,

            status: item.status,

            createdAt:
              Number.isFinite(
                item.createdAt
              )
                ? item.createdAt
                : Date.now()
          }));


      if (clean.length === 0) {

        throw new Error(
          "Backup contains no valid attempts."
        );

      }


      const confirmed =
        window.confirm(
          `Import ${clean.length} attempt(s)?\n\nExisting local data will be replaced.`
        );


      if (!confirmed) {

        fileInput.value =
          "";

        return;

      }


      passwords =
        clean;

      saveData();

      currentFilter =
        "all";

      searchTerm =
        "";

      searchInput.value =
        "";

      updateFilterButtons();

      render();


      showToast(
        "Backup imported successfully.",
        "success"
      );

    } catch (error) {

      console.error(
        "Import error:",
        error
      );


      showToast(
        "Invalid or corrupted backup file.",
        "error"
      );

    }


    fileInput.value =
      "";

  }
);

