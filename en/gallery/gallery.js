const previewImage = document.querySelector("#gallery-preview-image");
const previewCategory = document.querySelector("#gallery-preview-category");
const previewTitle = document.querySelector("#gallery-preview-title");
const previewDesc = document.querySelector("#gallery-preview-desc");
const previewPlan = document.querySelector("#gallery-preview-plan");
const previewPoint = document.querySelector("#gallery-preview-point");
const cards = [...document.querySelectorAll(".archive-card")];
const filters = [...document.querySelectorAll(".filter-button")];

function selectCard(card) {
  cards.forEach((item) => item.classList.toggle("is-active", item === card));

  previewImage.animate(
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0, transform: "scale(.985)" },
    ],
    { duration: 120, easing: "ease-out" },
  ).onfinish = () => {
    previewImage.src = card.dataset.src;
    previewImage.alt = card.dataset.title;
    previewCategory.textContent = card.dataset.label;
    previewTitle.textContent = card.dataset.title;
    previewDesc.textContent = card.dataset.desc;
    previewPlan.textContent = card.dataset.plan;
    previewPoint.textContent = card.dataset.point;

    previewImage.animate(
      [
        { opacity: 0, transform: "scale(.985)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 220, easing: "ease-out" },
    );
  };
}

function setFilter(filter) {
  filters.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === filter));

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
  card.addEventListener("click", () => selectCard(card));
});

filters.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});
