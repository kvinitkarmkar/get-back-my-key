
/* ============================================================
   SEARCH
============================================================ */

searchInput.addEventListener(
  "input",
  () => {

    searchTerm =
      searchInput.value;

    render();

  }
);


/* ============================================================
   FILTERS
============================================================ */

document
  .querySelectorAll(".filter-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentFilter =
          button.dataset.filter;

        updateFilterButtons();

        render();

      }
    );

  });


function updateFilterButtons() {

  document
    .querySelectorAll(".filter-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.filter === currentFilter
      );

    });

}

