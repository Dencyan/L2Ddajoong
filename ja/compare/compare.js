const compareData = {
  "mouth-basic": {
    src: "../assets/mouth-9.gif",
    alt: "口の動き9点サンプル",
    label: "Basic LD",
    title: "口の動き9点",
    desc: "軽い会話や一般的な配信に適した口の構造です。",
    plan: "ベーシックLD",
    use: "自然な発話と安定した基本動作を重視する場合",
  },
  "mouth-premium": {
    src: "../assets/mouth-12.gif",
    alt: "口の動き12点サンプル",
    label: "Premium LD",
    title: "口の動き12点",
    desc: "台詞と感情表現を豊かにする細かな口の構造です。",
    plan: "プレミアムLD",
    use: "会話量が多く、表情演技を重視するモデル",
  },
  vbridger: {
    src: "../assets/mouth-vbridger.gif",
    alt: "VBridger口モーションサンプル",
    label: "Advanced Option",
    title: "VBridger対応",
    desc: "広い発話範囲と豊かな口形変化に対応するオプションです。",
    plan: "プレミアムLD＋オプション",
    use: "細かな発話表現を重視する場合",
  },
  eyes: {
    src: "../assets/eyes-odd.gif",
    alt: "目の物理演算サンプル",
    label: "Premium LD",
    title: "瞳とまつ毛の物理演算",
    desc: "目の輝きと細かな視線変化でキャラクターに生命感を加えます。",
    plan: "プレミアムLD",
    use: "視線、ハイライト、顔のディテールを重視する場合",
  },
  body: {
    src: "../assets/body-z.gif",
    alt: "Z軸モーションサンプル",
    label: "Basic / Premium",
    title: "XYZ基本軸",
    desc: "顔と体のXYZ動作はLDリギングの基本的な操作感を左右します。",
    plan: "ベーシックLD以上",
    use: "全身モデルの立体感と自然な顔の動きが必要な場合",
  },
};

const compareImage = document.querySelector("#compare-image");
const compareLabel = document.querySelector("#compare-label");
const compareTitle = document.querySelector("#compare-title");
const compareDesc = document.querySelector("#compare-desc");
const comparePlan = document.querySelector("#compare-plan");
const compareUse = document.querySelector("#compare-use");
const compareTabs = [...document.querySelectorAll(".compare-tab")];

function setCompare(key) {
  const item = compareData[key];
  if (!item) return;

  compareTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.compare === key));
  compareImage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out" }).onfinish = () => {
    compareImage.src = item.src;
    compareImage.alt = item.alt;
    compareLabel.textContent = item.label;
    compareTitle.textContent = item.title;
    compareDesc.textContent = item.desc;
    comparePlan.textContent = item.plan;
    compareUse.textContent = item.use;
    compareImage.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
  };
}

compareTabs.forEach((tab) => {
  tab.addEventListener("click", () => setCompare(tab.dataset.compare));
});
