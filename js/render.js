
/* ============================================================
   RENDER
============================================================ */

function render() {

  updateStats();


  const normalizedSearch =
    searchTerm.toLowerCase();


  const filtered =
    passwords.filter(item => {

      const matchesFilter =
        currentFilter === "all" ||
        item.status === currentFilter;


      const matchesSearch =
        item.text
          .toLowerCase()
          .includes(normalizedSearch);


      return (
        matchesFilter &&
        matchesSearch
      );

    });


  list.innerHTML = "";


  if (filtered.length === 0) {

    const empty =
      document.createElement("div");

    empty.className =
      "empty";

    empty.textContent =
      passwords.length === 0
        ? "No password attempts yet."
        : "No matching attempts found.";

    list.appendChild(empty);

    return;
  }


  filtered.forEach(item => {

    const originalIndex =
      passwords.findIndex(
        password =>
          password.id === item.id
      );


    list.appendChild(
      createPasswordCard(
        item,
        originalIndex
      )
    );

  });

}


/* ============================================================
   CREATE PASSWORD CARD
============================================================ */

function createPasswordCard(
  item,
  index
) {

  const card =
    document.createElement("article");


  card.className =
    `password-card ${item.status}`;


  const main =
    document.createElement("div");

  main.className =
    "password-main";


  const password =
    document.createElement("span");

  password.className =
    "password-text";

  password.textContent =
    item.text;


  const meta =
    document.createElement("div");

  meta.className =
    "password-meta";


  const status =
    document.createElement("span");

  status.className =
    `status ${item.status}`;


  status.textContent =
    item.status === "success"
      ? "Success"
      : item.status === "failed"
        ? "Failed"
        : "Pending";


  const date =
    document.createElement("span");

  date.className =
    "date";

  date.textContent =
    formatDate(item.createdAt);


  meta.appendChild(status);
  meta.appendChild(date);


  main.appendChild(password);
  main.appendChild(meta);


  /* Actions */

  const actions =
    document.createElement("div");

  actions.className =
    "actions";


  /* Copy */

  const copyButton =
    createActionButton(
      icons.copy,
      "Copy password"
    );

  copyButton.addEventListener(
    "click",
    () => {
      copyText(
        item.text,
        copyButton
      );
    }
  );


  /* Success */

  const successButton =
    createActionButton(
      icons.check,
      "Mark as successful"
    );

  successButton.classList.add(
    "success-btn"
  );


  if (item.status === "success") {
    successButton.classList.add(
      "active"
    );
  }


  successButton.addEventListener(
    "click",
    () => {
      markStatus(
        index,
        "success"
      );
    }
  );


  /* Failed */

  const failedButton =
    createActionButton(
      icons.x,
      "Mark as failed"
    );

  failedButton.classList.add(
    "failed-btn"
  );


  if (item.status === "failed") {
    failedButton.classList.add(
      "active"
    );
  }


  failedButton.addEventListener(
    "click",
    () => {
      markStatus(
        index,
        "failed"
      );
    }
  );


  /* Delete */

  const deleteButton =
    createActionButton(
      icons.trash,
      "Delete attempt"
    );


  deleteButton.addEventListener(
    "click",
    () => {
      deleteItem(index);
    }
  );


  actions.appendChild(copyButton);
  actions.appendChild(successButton);
  actions.appendChild(failedButton);
  actions.appendChild(deleteButton);


  card.appendChild(main);
  card.appendChild(actions);


  return card;

}


function createActionButton(
  svgContent,
  label
) {

  const button =
    document.createElement("button");


  button.type =
    "button";

  button.className =
    "action-btn";

  button.setAttribute(
    "aria-label",
    label
  );

  button.title =
    label;


  button.innerHTML = `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      ${svgContent}
    </svg>
  `;


  return button;

}


/* ============================================================
   STATS
============================================================ */

function updateStats() {

  const total =
    passwords.length;


  const tried =
    passwords.filter(
      item =>
        item.status !== "pending"
    ).length;


  const success =
    passwords.filter(
      item =>
        item.status === "success"
    ).length;


  totalCount.textContent =
    total;

  triedCount.textContent =
    tried;

  successCount.textContent =
    success;

}

