const estimateData = {
  base: [
    { id: "", label: "기본 리깅 선택", price: 0 },
    { id: "sd-owner", label: "동물 / 오너캐릭터", price: 150000 },
    { id: "sd", label: "SD 전신", price: 230000 },
    { id: "basic-half", label: "베이직 LD 반신", price: 350000 },
    { id: "basic-full", label: "베이직 LD 전신", price: 450000 },
    { id: "premium-half", label: "프리미엄 LD 반신", price: 670000 },
    { id: "premium-full", label: "프리미엄 LD 전신", price: 780000 },
  ],
  options: [
    { id: "expr", label: "추가 표정", priceText: "+10,000원 / 개", price: 10000, count: true },
    { id: "expr-anim", label: "표정 애니메이션", priceText: "30,000원~ / 개", price: 30000, count: true, approximate: true },
    { id: "acc", label: "악세서리 / 소품", priceText: "20,000~40,000원", price: 0, approximate: true },
    { id: "ear", label: "귀 / 꼬리", priceText: "35,000원~", price: 0, approximate: true },
    { id: "wing", label: "날개 / 뿔", priceText: "금액 협의", price: 0, approximate: true },
    { id: "arm-swing", label: "팔 흔들림 추가", priceText: "30,000원", price: 30000 },
    { id: "arm-part", label: "팔 파츠 (마이크, 게임기 등)", priceText: "금액 협의", price: 0, approximate: true },
    { id: "outfit", label: "추가 의상", priceText: "금액 협의", price: 0, approximate: true },
    { id: "hair", label: "추가 헤어", priceText: "금액 협의", price: 0, approximate: true },
    { id: "mouth-x", label: "입 X", priceText: "20,000원", price: 20000 },
    { id: "chub", label: "볼빵빵", priceText: "20,000원", price: 20000 },
    { id: "tongue", label: "메롱", priceText: "70,000원", price: 70000 },
    { id: "vbridger-a", label: "입 X + 볼빵빵 + VBridger", priceText: "120,000원", price: 120000 },
    { id: "vbridger-b", label: "입 X + 볼빵빵 + 메롱 + VBridger", priceText: "190,000원", price: 190000 },
  ],
  discounts: [
    { id: "", label: "할인 없음", price: 0 },
    { id: "collab", label: "협업 작가님 LD 할인", price: -50000 },
    { id: "review", label: "아트머그 리뷰 이벤트 할인", price: -20000 },
  ],
};

const formatWon = (value) => `${Math.max(0, value).toLocaleString("ko-KR")}원`;

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
      <strong>미니 견적</strong>
    </button>
    <form class="estimate-panel" id="estimate-panel" aria-hidden="true">
      <div class="estimate-head">
        <span>간단 견적</span>
        <button class="estimate-close" type="button" aria-label="견적 닫기">×</button>
      </div>
      <label class="estimate-field">
        <span>기본 리깅</span>
        <select name="base">
          ${estimateData.base.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </label>
      <div class="estimate-option-grid">
        ${estimateData.options.map((item) => `
          <label class="estimate-check">
            <input type="checkbox" name="option" value="${item.id}" />
            <span>${item.label}<small>${item.priceText || `${item.price.toLocaleString("ko-KR")}원`}</small></span>
            ${item.count ? `<input class="estimate-count" type="number" min="1" max="20" value="1" aria-label="${item.label} 개수" disabled />` : ""}
          </label>
        `).join("")}
      </div>
      <label class="estimate-field">
        <span>할인</span>
        <select name="discount">
          ${estimateData.discounts.map((item) => `<option value="${item.id}">${item.label}</option>`).join("")}
        </select>
      </label>
      <details class="estimate-consult">
        <summary>상담 옵션 안내</summary>
        <p>범위(~) 및 금액 협의 옵션은 합계에 고정 금액으로 더하지 않고 상담 후 확정됩니다.</p>
      </details>
      <div class="estimate-result">
        <span>예상 견적</span>
        <strong data-estimate-total>0원</strong>
        <p data-estimate-note>기본 리깅을 선택해 주세요.</p>
      </div>
      <a class="estimate-submit" href="/contact/">비공개 문의 폼 작성하기</a>
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
      ? "기본 리깅을 선택해 주세요."
      : hasApprox
        ? "일부 옵션은 시작가 기준이며 최종 금액은 상담 후 확정됩니다."
        : "최종 금액은 파일 구조와 상담 내용에 따라 확정됩니다.";
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
