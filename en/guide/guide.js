const guideTabs = [...document.querySelectorAll(".guide-tab")];
const guideSheets = [...document.querySelectorAll(".guide-sheet")];
const accordionButtons = [...document.querySelectorAll(".notice-accordion button")];

function showGuidePage(page) {
  guideTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.guidePage === page));
  guideSheets.forEach((sheet) => {
    const isActive = sheet.dataset.guideSheet === page;
    sheet.classList.toggle("is-active", isActive);
  });
}

guideTabs.forEach((tab) => {
  tab.addEventListener("click", () => showGuidePage(tab.dataset.guidePage));
});

accordionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    const expanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!expanded));
    if (panel) panel.hidden = expanded;
  });
});
