const samples = {
  "body-x": {
    src: "./assets/body-x.gif",
    alt: "Live2D X축 움직임 샘플",
    kind: "전신 리깅",
    title: "X축 움직임",
    desc: "좌우 고개 회전과 몸의 입체감을 확인할 수 있는 기본 축 샘플입니다.",
  },
  "body-y": {
    src: "./assets/body-y.gif",
    alt: "Live2D Y축 움직임 샘플",
    kind: "전신 리깅",
    title: "Y축 움직임",
    desc: "상하 시선과 고개 각도를 부드럽게 연결해 캐릭터의 존재감을 살립니다.",
  },
  "body-z": {
    src: "./assets/body-z.gif",
    alt: "Live2D Z축 움직임 샘플",
    kind: "전신 리깅",
    title: "Z축 틸트",
    desc: "좌우 기울기와 머리카락, 장식 물리를 함께 확인할 수 있습니다.",
  },
  eyes: {
    src: "./assets/eyes-odd.gif",
    alt: "Live2D 눈 물리 샘플",
    kind: "눈 물리",
    title: "오드아이 하이라이트",
    desc: "눈동자, 하이라이트, 속눈썹의 작은 움직임으로 시선을 더 선명하게 만듭니다.",
  },
  mouth: {
    src: "./assets/mouth-12.gif",
    alt: "Live2D 입 12점 움직임 샘플",
    kind: "입 움직임",
    title: "12점 발화 구조",
    desc: "대화와 감정 표현을 더 풍부하게 보여주는 세밀한 입 모양 샘플입니다.",
  },
  heart: {
    src: "./assets/expression-heart.gif",
    alt: "Live2D 하트눈 표정 샘플",
    kind: "표정 효과",
    title: "하트눈 애니메이션",
    desc: "단축키 한 번으로 방송 중 감정을 또렷하게 전달할 수 있는 연출입니다.",
  },
  hair: {
    src: "./assets/hair-change.gif",
    alt: "Live2D 헤어 변경 샘플",
    kind: "의상 및 헤어",
    title: "헤어 스타일 변경",
    desc: "전환 후에도 스타일별 머리카락 물리가 자연스럽게 이어지도록 구성합니다.",
  },
  hand: {
    src: "./assets/hand-wave.gif",
    alt: "Live2D 손인사 샘플",
    kind: "팔 움직임",
    title: "손인사 디테일",
    desc: "손가락과 팔 흔들림을 캐릭터 콘셉트에 맞춰 자연스럽게 연출합니다.",
  },
};

const sampleImage = document.querySelector("#sample-image");
const sampleKind = document.querySelector("#sample-kind");
const sampleTitle = document.querySelector("#sample-title");
const sampleDesc = document.querySelector("#sample-desc");
const sampleButtons = document.querySelectorAll("[data-sample]");
const demoCover = document.querySelector("#demo-cover");
const entryLoader = document.querySelector("#entry-loader");

if (entryLoader) {
  document.body.classList.add("is-loading");

  const closeEntryLoader = () => {
    entryLoader.classList.add("is-done");
    document.body.classList.remove("is-loading");
    window.setTimeout(() => entryLoader.remove(), 520);
  };

  try {
    const hasSeenLoader = sessionStorage.getItem("dajoong-loader-seen") === "1";
    if (hasSeenLoader) {
      entryLoader.remove();
      document.body.classList.remove("is-loading");
    } else {
      sessionStorage.setItem("dajoong-loader-seen", "1");
      window.addEventListener("load", () => window.setTimeout(closeEntryLoader, 680), { once: true });
      window.setTimeout(closeEntryLoader, 2200);
    }
  } catch {
    window.addEventListener("load", () => window.setTimeout(closeEntryLoader, 680), { once: true });
    window.setTimeout(closeEntryLoader, 2200);
  }
}

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const next = samples[button.dataset.sample];
    if (!next || !sampleImage || !sampleKind || !sampleTitle || !sampleDesc) return;

    sampleButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    sampleImage.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(1.015)" },
      ],
      { duration: 120, easing: "ease-out" },
    ).onfinish = () => {
      sampleImage.src = next.src;
      sampleImage.alt = next.alt;
      sampleKind.textContent = next.kind;
      sampleTitle.textContent = next.title;
      sampleDesc.textContent = next.desc;
      sampleImage.animate(
        [
          { opacity: 0, transform: "scale(1.015)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 220, easing: "ease-out" },
      );
    };
  });
});

demoCover?.addEventListener("click", () => {
  demoCover.classList.add("is-hidden");
});

const canvas = document.querySelector("#motion-field");
const ctx = canvas?.getContext("2d");
let width = 0;
let height = 0;
let dots = [];

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth * window.devicePixelRatio;
  height = canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  dots = Array.from({ length: Math.min(80, Math.floor(window.innerWidth / 16)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: (Math.random() * 2.4 + 1.2) * window.devicePixelRatio,
    vx: (Math.random() - .5) * .25 * window.devicePixelRatio,
    vy: (Math.random() - .5) * .25 * window.devicePixelRatio,
    hue: Math.random() > .5 ? "125,135,255" : "255,149,202",
  }));
}

function drawField() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  dots.forEach((dot) => {
    dot.x += dot.vx;
    dot.y += dot.vy;

    if (dot.x < 0 || dot.x > width) dot.vx *= -1;
    if (dot.y < 0 || dot.y > height) dot.vy *= -1;

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${dot.hue}, .34)`;
    ctx.fill();
  });

  requestAnimationFrame(drawField);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawField();
