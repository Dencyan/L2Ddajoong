const estimateData = {
  base: [
    { id: "", label: "基本リギングを選択", price: 0 },
    { id: "sd-owner", label: "動物・オリジナルキャラクター", price: 150000 },
    { id: "sd", label: "SD全身", price: 230000 },
    { id: "basic-half", label: "ベーシックLD半身", price: 350000 },
    { id: "basic-full", label: "ベーシックLD全身", price: 450000 },
    { id: "premium-half", label: "プレミアムLD半身", price: 670000 },
    { id: "premium-full", label: "プレミアムLD全身", price: 780000 },
  ],
  options: [
    { id: "expr", label: "追加表情", priceText: "+10,000ウォン／1点", price: 10000, count: true },
    { id: "expr-anim", label: "表情アニメーション", priceText: "30,000ウォン～／1点", price: 30000, count: true, approximate: true },
    { id: "acc", label: "アクセサリー・小物", priceText: "20,000～40,000ウォン", price: 0, approximate: true },
    { id: "ear", label: "耳・尻尾", priceText: "35,000ウォン～", price: 0, approximate: true },
    { id: "wing", label: "翼・角", priceText: "要相談", price: 0, approximate: true },
    { id: "arm-swing", label: "腕揺れ追加", priceText: "30,000ウォン", price: 30000 },
    { id: "arm-part", label: "腕パーツ（マイク、ゲーム機など）", priceText: "要相談", price: 0, approximate: true },
    { id: "outfit", label: "追加衣装", priceText: "要相談", price: 0, approximate: true },
    { id: "hair", label: "追加髪型", priceText: "要相談", price: 0, approximate: true },
    { id: "mouth-x", label: "口X", priceText: "20,000ウォン", price: 20000 },
    { id: "chub", label: "頬ぷく", priceText: "20,000ウォン", price: 20000 },
    { id: "tongue", label: "舌出し", priceText: "70,000ウォン", price: 70000 },
    { id: "vbridger-a", label: "口X＋頬ぷく＋VBridger", priceText: "120,000ウォン", price: 120000 },
    { id: "vbridger-b", label: "口X＋頬ぷく＋舌出し＋VBridger", priceText: "190,000ウォン", price: 190000 },
  ],
  discounts: [
    { id: "", label: "割引なし", price: 0 },
    { id: "collab", label: "提携イラストレーターLD割引", price: -50000 },
    { id: "review", label: "レビューキャンペーン割引", price: -20000 },
  ],
};

const formatWon = (value) => `${Math.max(0, value).toLocaleString("ja-JP")}ウォン`;

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
      <strong>簡易見積り</strong>
    </button>
    <form class="estimate-panel" id="estimate-panel" aria-hidden="true">
      <div class="estimate-head">
        <span>簡易見積り</span>
        <button class="estimate-close" type="button" aria-label="見積りを閉じる">×</button>
      </div>
      <label class="estimate-field">
        <span>基本リギング</span>
        <select name="base">
          ${estimateData.base.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </label>
      <div class="estimate-option-grid">
        ${estimateData.options.map((item) => `
          <label class="estimate-check">
            <input type="checkbox" name="option" value="${item.id}" />
            <span>${item.label}<small>${item.priceText || `${item.price.toLocaleString("ja-JP")}ウォン`}</small></span>
            ${item.count ? `<input class="estimate-count" type="number" min="1" max="20" value="1" aria-label="${item.label}の数量" disabled />` : ""}
          </label>
        `).join("")}
      </div>
      <label class="estimate-field">
        <span>割引</span>
        <select name="discount">
          ${estimateData.discounts.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </label>
      <details class="estimate-consult">
        <summary>要相談オプション</summary>
        <p>料金幅のある項目や要相談の項目は合計に固定額として加算されず、ご相談後に確定します。</p>
      </details>
      <div class="estimate-result">
        <span>概算見積り</span>
        <strong data-estimate-total>0ウォン</strong>
        <p data-estimate-note>基本リギングを選択してください。</p>
      </div>
      <a class="estimate-submit" href="https://artmug.kr/index.php?channel=view&uid=42826" target="_blank" rel="noopener noreferrer">ArtMugでお問い合わせ</a>
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
      ? "基本リギングを選択してください。"
      : hasApprox
        ? "一部オプションは開始価格です。最終料金はご相談後に確定します。"
        : "最終料金はファイル構造とご相談内容により確定します。";
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
