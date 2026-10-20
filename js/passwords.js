
/* ============================================================
   ADD PASSWORD
============================================================ */

function addPassword() {

  const value =
    passwordInput.value;

  if (!value.trim()) {

    showToast(
      "Enter a password combination first.",
      "error"
    );

    passwordInput.focus();

    return;
  }


  const existingIndex =
    passwords.findIndex(
      item => item.text === value
    );


  if (existingIndex !== -1) {

    const attemptNumber =
      existingIndex + 1;

    showToast(
      `This combination already exists as attempt #${attemptNumber}.`,
      "error"
    );

    passwordInput.select();

    return;
  }


  const newItem = {

    id: createId(),

    text: value,

    status: "pending",

    createdAt: Date.now()

  };


  passwords.unshift(newItem);

  saveData();

  passwordInput.value = "";

  currentFilter = "all";

  updateFilterButtons();

  render();

  showToast(
    "Password combination added.",
    "success"
  );

  passwordInput.focus();

}


/* ============================================================
   MARK STATUS
============================================================ */

function markStatus(index, status) {

  if (!passwords[index]) {
    return;
  }


  if (status === "success") {

    if (passwords[index].status === "success") {
      return;
    }

    openSuccessConfirmation(index);

    return;
  }


  passwords[index].status =
    passwords[index].status === "failed"
      ? "pending"
      : "failed";

  saveData();

  render();

  showToast(
    passwords[index].status === "failed"
      ? "Marked as failed."
      : "Moved back to pending.",
    "error"
  );

}


/* ============================================================
   DELETE
============================================================ */

function deleteItem(index) {

  if (!passwords[index]) {
    return;
  }

  openDeleteConfirmation(index);

}

