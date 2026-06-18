const samples = {
  "body-x": {
    src: "../assets/body-x.gif",
    alt: "Live2D X-axis Motion Sample",
    kind: "Full-body Rigging",
    title: "X-axis Motion",
    desc: "A core axis sample showing head turns and three-dimensional body volume.",
  },
  "body-y": {
    src: "../assets/body-y.gif",
    alt: "Live2D Y-axis Motion Sample",
    kind: "Full-body Rigging",
    title: "Y-axis Motion",
    desc: "Smoothly connects vertical gaze and head angles to give the character more presence.",
  },
  "body-z": {
    src: "../assets/body-z.gif",
    alt: "Live2D Z-axis Motion Sample",
    kind: "Full-body Rigging",
    title: "Z-axis Tilt",
    desc: "Shows side-to-side tilt together with hair and accessory physics.",
  },
  eyes: {
    src: "../assets/eyes-odd.gif",
    alt: "Live2D Eye Physics Sample",
    kind: "Eye Physics",
    title: "Heterochromia Highlights",
    desc: "Subtle iris, highlight, and eyelash motion makes the gaze more vivid.",
  },
  mouth: {
    src: "../assets/mouth-12.gif",
    alt: "Live2D 12-point Mouth Sample",
    kind: "Mouth Movement",
    title: "12-point Mouth Structure",
    desc: "A detailed mouth sample for richer dialogue and emotional expression.",
  },
  heart: {
    src: "../assets/expression-heart.gif",
    alt: "Live2D Heart Eyes Expression Sample",
    kind: "Expression Effect",
    title: "Heart Eyes Animation",
    desc: "A hotkey animation that clearly communicates emotion during streams.",
  },
  hair: {
    src: "../assets/hair-change.gif",
    alt: "Live2D Hairstyle Toggle Sample",
    kind: "Outfits and Hair",
    title: "Hairstyle Toggle",
    desc: "Hair physics stays natural across hairstyle changes.",
  },
  hand: {
    src: "../assets/hand-wave.gif",
    alt: "Live2D Hand Wave Sample",
    kind: "Arm Motion",
    title: "Hand Wave Detail",
    desc: "Finger and arm movement is tailored naturally to the character concept.",
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
