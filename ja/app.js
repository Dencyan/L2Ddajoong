const samples = {
  "body-x": {
    src: "../assets/body-x.gif",
    alt: "Live2D X軸モーションサンプル",
    kind: "全身リギング",
    title: "X軸の動き",
    desc: "左右の顔の回転と体の立体感を確認できる基本軸サンプルです。",
  },
  "body-y": {
    src: "../assets/body-y.gif",
    alt: "Live2D Y軸モーションサンプル",
    kind: "全身リギング",
    title: "Y軸の動き",
    desc: "上下の視線と顔の角度を滑らかにつなぎ、キャラクターの存在感を高めます。",
  },
  "body-z": {
    src: "../assets/body-z.gif",
    alt: "Live2D Z軸モーションサンプル",
    kind: "全身リギング",
    title: "Z軸の傾き",
    desc: "左右の傾きと髪・装飾の物理演算を同時に確認できます。",
  },
  eyes: {
    src: "../assets/eyes-odd.gif",
    alt: "Live2D 目の物理演算サンプル",
    kind: "目の物理演算",
    title: "オッドアイハイライト",
    desc: "瞳、ハイライト、まつ毛の細かな動きで視線をより鮮明にします。",
  },
  mouth: {
    src: "../assets/mouth-12.gif",
    alt: "Live2D 12点口モーションサンプル",
    kind: "口の動き",
    title: "12点発話構造",
    desc: "会話と感情表現を豊かにする細かな口形サンプルです。",
  },
  heart: {
    src: "../assets/expression-heart.gif",
    alt: "Live2D ハート目表情サンプル",
    kind: "表情エフェクト",
    title: "ハート目アニメーション",
    desc: "ショートカット一つで配信中の感情をはっきり伝えられる演出です。",
  },
  hair: {
    src: "../assets/hair-change.gif",
    alt: "Live2D 髪型切り替えサンプル",
    kind: "衣装・髪型",
    title: "髪型切り替え",
    desc: "切り替え後も髪型ごとの物理演算が自然につながるように構成します。",
  },
  hand: {
    src: "../assets/hand-wave.gif",
    alt: "Live2D 手振りサンプル",
    kind: "腕の動き",
    title: "手振りのディテール",
    desc: "指と腕の揺れをキャラクターのコンセプトに合わせて自然に演出します。",
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
