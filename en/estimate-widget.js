const estimateData = {
  base: [
    { id: "", label: "Select Base Rigging", price: 0 },
    { id: "sd-owner", label: "Animal / Original Character", price: 150000 },
    { id: "sd", label: "SD Full Body", price: 230000 },
    { id: "basic-half", label: "Basic LD Half Body", price: 350000 },
    { id: "basic-full", label: "Basic LD Full Body", price: 450000 },
    { id: "premium-half", label: "Premium LD Half Body", price: 670000 },
    { id: "premium-full", label: "Premium LD Full Body", price: 780000 },
  ],
  options: [
    { id: "expr", label: "Additional Expression", priceText: "+KRW 10,000 each", price: 10000, count: true },
    { id: "expr-anim", label: "Expression Animation", priceText: "From KRW 30,000 each", price: 30000, count: true, approximate: true },
    { id: "acc", label: "Accessories / Props", priceText: "KRW 20,000-40,000", price: 0, approximate: true },
    { id: "ear", label: "Ears / Tail", priceText: "From KRW 35,000", price: 0, approximate: true },
    { id: "wing", label: "Wings / Horns", priceText: "Quote required", price: 0, approximate: true },
    { id: "arm-swing", label: "Additional Arm Sway", priceText: "KRW 30,000", price: 30000 },
    { id: "arm-part", label: "Arm Parts (microphone, controller, etc.)", priceText: "Quote required", price: 0, approximate: true },
    { id: "outfit", label: "Additional Outfit", priceText: "Quote required", price: 0, approximate: true },
    { id: "hair", label: "Additional Hairstyle", priceText: "Quote required", price: 0, approximate: true },
    { id: "mouth-x", label: "Mouth X", priceText: "KRW 20,000", price: 20000 },
    { id: "chub", label: "Puffed Cheeks", priceText: "KRW 20,000", price: 20000 },
    { id: "tongue", label: "Tongue Out", priceText: "KRW 70,000", price: 70000 },
    { id: "vbridger-a", label: "Mouth X + Puffed Cheeks + VBridger", priceText: "KRW 120,000", price: 120000 },
    { id: "vbridger-b", label: "Mouth X + Puffed Cheeks + Tongue Out + VBridger", priceText: "KRW 190,000", price: 190000 },
  ],
  discounts: [
    { id: "", label: "No Discount", price: 0 },
    { id: "collab", label: "Partner Illustrator LD Discount", price: -50000 },
    { id: "review", label: "Review Promotion Discount", price: -20000 },
  ],
};

const formatWon = (value) => `${Math.max(0, value).toLocaleString("en-US")} KRW`;

function mountRevealEffects() {
  const targets = [
    ".hero-copy",
    ".hero-stage",
    ".home-map-card",
    ".notice-strip article",
    ".section-heading",
    ".sample-viewer",
    ".sample-controls",
    ".video-feature",
    ".video-card",
    ".handoff-grid article",
    ".contact-panel",
    ".sub-hero",
    ".gallery-preview",
    ".archive-card",
    ".guide-index",
    ".guide-sheet",
    ".compare-plan",
    ".compare-viewer",
    ".recommend-grid article",
    ".price-reference-grid article",
    ".live-theater",
    ".live-sidebar",
    ".live-tips article",
  ];
  const elements = [...document.querySelectorAll(targets.join(","))]
    .filter((element) => !element.closest(".estimate-widget"));

  if (!elements.length) return;

  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  elements.forEach((element, index) => {
    element.classList.add("motion-reveal");
    element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: .12,
    rootMargin: "0px 0px -8% 0px",
  });

  elements.forEach((element) => observer.observe(element));
}

function createEstimateWidget() {
  const root = document.createElement("aside");
  root.className = "estimate-widget";
  root.innerHTML = `
    <button class="estimate-toggle" type="button" aria-expanded="false" aria-controls="estimate-panel">
      <span>₩</span>
      <strong>Quick Estimate</strong>
    </button>
    <form class="estimate-panel" id="estimate-panel" aria-hidden="true">
      <div class="estimate-head">
        <span>Quick Estimate</span>
        <button class="estimate-close" type="button" aria-label="Close estimate">×</button>
      </div>
      <label class="estimate-field">
        <span>Base Rigging</span>
        <select name="base">
          ${estimateData.base.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </label>
      <div class="estimate-option-grid">
        ${estimateData.options.map((item) => `
          <label class="estimate-check">
            <input type="checkbox" name="option" value="${item.id}" />
            <span>${item.label}<small>${item.priceText || `${item.price.toLocaleString("en-US")} KRW`}</small></span>
            ${item.count ? `<input class="estimate-count" type="number" min="1" max="20" value="1" aria-label="${item.label} quantity" disabled />` : ""}
          </label>
        `).join("")}
      </div>
      <label class="estimate-field">
        <span>Discount</span>
        <select name="discount">
          ${estimateData.discounts.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </label>
      <details class="estimate-consult">
        <summary>Consultation Options</summary>
        <p>Options with a price range or custom quote are confirmed after consultation and are not added as fixed amounts.</p>
      </details>
      <div class="estimate-result">
        <span>Estimated Total</span>
        <strong data-estimate-total>KRW 0</strong>
        <p data-estimate-note>Please select a base rigging plan.</p>
      </div>
      <a class="estimate-submit" href="https://artmug.kr/index.php?channel=view&uid=42826" target="_blank" rel="noopener noreferrer">Contact via ArtMug</a>
    </form>
  `;

  document.body.append(root);
  return root;
}

function mountEstimateWidget() {
  const widget = createEstimateWidget();
  const toggle = widget.querySelector(".estimate-toggle");
  const panel = widget.querySelector(".estimate-panel");
  const close = widget.querySelector(".estimate-close");
  const form = widget.querySelector("form");
  const totalEl = widget.querySelector("[data-estimate-total]");
  const noteEl = widget.querySelector("[data-estimate-note]");

  function setOpen(open) {
    widget.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
  }

  function calculate() {
    const formData = new FormData(form);
    const base = estimateData.base.find((item) => item.id === formData.get("base"));
    const discount = estimateData.discounts.find((item) => item.id === formData.get("discount"));
    let total = base?.price || 0;
    let hasApprox = false;

    widget.querySelectorAll(".estimate-check").forEach((label) => {
      const checkbox = label.querySelector("input[type='checkbox']");
      const countInput = label.querySelector(".estimate-count");
      const option = estimateData.options.find((item) => item.id === checkbox.value);

      label.classList.toggle("is-active", checkbox.checked);
      if (countInput) countInput.disabled = !checkbox.checked;
      if (!checkbox.checked || !option) return;

      const count = countInput ? Math.max(1, Number(countInput.value || 1)) : 1;
      total += option.price * count;
      if (option.approximate) hasApprox = true;
    });

    total += discount?.price || 0;
    totalEl.textContent = formatWon(total);
    noteEl.textContent = !base?.id
      ? "Please select a base rigging plan."
      : hasApprox
        ? "Some options use starting prices. The final amount is confirmed after consultation."
        : "The final price depends on the file structure and consultation.";
  }

  toggle.addEventListener("click", () => setOpen(!widget.classList.contains("is-open")));
  close.addEventListener("click", () => setOpen(false));
  form.addEventListener("input", calculate);
  form.addEventListener("change", calculate);
  calculate();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    mountRevealEffects();
    mountEstimateWidget();
  });
} else {
  mountRevealEffects();
  mountEstimateWidget();
}
