
/* ============================================================
   TOAST
============================================================ */

function showToast(
  message,
  type = "success"
) {

  clearTimeout(toastTimer);


  toast.className =
    `toast ${type}`;


  toastText.textContent =
    message;


  toastIcon.innerHTML =
    type === "success"
      ? icons.success
      : icons.error;


  requestAnimationFrame(() => {

    toast.classList.add(
      "show"
    );

  });


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 3200);

}

