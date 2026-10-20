
/* ============================================================
   COPY
============================================================ */

async function copyText(text, button) {

  try {

    await navigator.clipboard.writeText(text);

    const oldHTML =
      button.innerHTML;


    button.innerHTML = icons.success;

    button.classList.add("active");


    showToast(
      "Password copied to clipboard.",
      "success"
    );


    setTimeout(() => {

      button.innerHTML =
        oldHTML;

      button.classList.remove("active");

    }, 900);

  } catch (error) {

    try {

      const textarea =
        document.createElement("textarea");

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();

      document.execCommand("copy");

      textarea.remove();


      showToast(
        "Password copied to clipboard.",
        "success"
      );

    } catch (_) {

      showToast(
        "Unable to copy. Copy it manually.",
        "error"
      );

    }

  }

}

