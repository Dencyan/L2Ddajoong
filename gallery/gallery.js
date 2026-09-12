const previewImage = document.querySelector("#gallery-preview-image");
const previewCategory = document.querySelector("#gallery-preview-category");
const previewTitle = document.querySelector("#gallery-preview-title");
const previewDesc = document.querySelector("#gallery-preview-desc");
const previewPlan = document.querySelector("#gallery-preview-plan");
const previewPoint = document.querySelector("#gallery-preview-point");
const cards = [...document.querySelectorAll(".archive-card")];
const filters = [...document.querySelectorAll(".filter-button")];

const preview = document.querySelector(".gallery-preview");
preview.tabIndex = -1;
previewTitle.setAttribute("aria-live", "polite");
function selectCard(card, reveal = false) {
  cards.forEach((item) => {
    item.classList.toggle("is-active", item === card);
    item.setAttribute("aria-pressed", String(item === card));
  });
  // Apply immediately: rapid clicks must never let an old animation win.
  previewImage.src = card.dataset.src;
  previewImage.alt = card.dataset.title;
  previewCategory.textContent = card.dataset.label;
  previewTitle.textContent = card.dataset.title;
  previewDesc.textContent = card.dataset.desc;
  previewPlan.textContent = card.dataset.plan;
  previewPoint.textContent = card.dataset.point;
  if (reveal && window.matchMedia("(max-width: 940px)").matches) {
    preview.focus({ preventScroll: true });
    preview.scrollIntoView({ block: "start", behavior: "instant" });
  }
}

function setFilter(filter) {
  filters.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
    button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
  });

  let firstVisible = null;
  cards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.category === filter;
    card.hidden = !isVisible;
    if (isVisible && !firstVisible) firstVisible = card;
  });

  if (firstVisible && !firstVisible.classList.contains("is-active")) {
    selectCard(firstVisible);
  }
}

cards.forEach((card) => {
  card.setAttribute("aria-pressed", String(card.classList.contains("is-active")));
  card.addEventListener("click", () => selectCard(card, true));
});

filters.forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});
