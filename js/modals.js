
/* ============================================================
   SUCCESS CONFIRMATION
============================================================ */

function openSuccessConfirmation(index) {

  if (!passwords[index]) {
    return;
  }

  pendingSuccessIndex = index;

  confirmPassword.textContent =
    passwords[index].text;

  confirmModal.classList.add("show");

  setTimeout(() => {
    confirmSuccess.focus();
  }, 30);

}


function closeSuccessConfirmation() {

  pendingSuccessIndex = null;

  confirmModal.classList.remove("show");

}


confirmSuccess.addEventListener(
  "click",
  confirmSuccessfulPassword
);


cancelConfirm.addEventListener(
  "click",
  closeSuccessConfirmation
);


confirmModal.addEventListener(
  "click",
  event => {

    if (event.target === confirmModal) {
      closeSuccessConfirmation();
    }

  }
);


function confirmSuccessfulPassword() {

  if (
    pendingSuccessIndex === null ||
    !passwords[pendingSuccessIndex]
  ) {
    closeSuccessConfirmation();
    return;
  }


  const index =
    pendingSuccessIndex;


  passwords[index].status =
    "success";

  saveData();

  render();

  closeSuccessConfirmation();

  triggerHaptic();

  playSuccessSound();

  showCelebration();

}


/* ============================================================
   DELETE CONFIRMATION
============================================================ */

function openDeleteConfirmation(index) {

  if (!passwords[index]) {
    return;
  }

  pendingDeleteIndex = index;

  deletePassword.textContent =
    passwords[index].text;

  deleteModal.classList.add("show");

  setTimeout(() => {
    cancelDelete.focus();
  }, 30);

}


function closeDeleteConfirmation() {

  pendingDeleteIndex = null;

  deleteModal.classList.remove("show");

}


cancelDelete.addEventListener(
  "click",
  closeDeleteConfirmation
);


confirmDelete.addEventListener(
  "click",
  confirmDeleteItem
);


deleteModal.addEventListener(
  "click",
  event => {

    if (event.target === deleteModal) {
      closeDeleteConfirmation();
    }

  }
);


function confirmDeleteItem() {

  if (
    pendingDeleteIndex === null ||
    !passwords[pendingDeleteIndex]
  ) {
    closeDeleteConfirmation();
    return;
  }


  const index =
    pendingDeleteIndex;


  passwords.splice(index, 1);

  saveData();

  render();

  closeDeleteConfirmation();

  showToast(
    "Attempt deleted.",
    "error"
  );

}

