
/* ============================================================
   KEYBOARD
============================================================ */

passwordInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      addPassword();

    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      if (
        confirmModal.classList.contains(
          "show"
        )
      ) {

        closeSuccessConfirmation();

      }


      if (
        deleteModal.classList.contains(
          "show"
        )
      ) {

        closeDeleteConfirmation();

      }


      if (
        celebration.classList.contains(
          "show"
        )
      ) {

        closeCelebrationScreen();

      }


      toast.classList.remove(
        "show"
      );

    }

  }
);


/* ============================================================
   ADD BUTTON
============================================================ */

addButton.addEventListener(
  "click",
  addPassword
);

