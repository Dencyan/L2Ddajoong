const liveGate = document.querySelector("#live-gate");
const liveFrame = document.querySelector("#live-demo-frame");
const checkboxes = [...document.querySelectorAll(".live-checks input")];

liveGate?.addEventListener("click", () => {
  liveGate.classList.add("is-hidden");
  liveFrame?.focus();
});

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    checkbox.closest("label")?.classList.toggle("is-checked", checkbox.checked);
  });
});
