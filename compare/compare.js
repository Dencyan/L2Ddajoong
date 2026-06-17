const compareData = {
  "mouth-basic": {
    src: "../assets/mouth-9.gif",
    alt: "입 움직임 9점 샘플",
    label: "Basic LD",
    title: "입 움직임 9점",
    desc: "가벼운 대화와 기본 방송용 사용에 적합한 입 구조입니다.",
    plan: "베이직 LD",
    use: "깔끔한 발화와 안정적인 기본 움직임이 우선일 때",
  },
  "mouth-premium": {
    src: "../assets/mouth-12.gif",
    alt: "입 움직임 12점 샘플",
    label: "Premium LD",
    title: "입 움직임 12점",
    desc: "대사와 감정 표현을 더 풍부하게 보여주는 세밀한 입 구조입니다.",
    plan: "프리미엄 LD",
    use: "대화량이 많고 표정 연기가 중요한 모델일 때",
  },
  vbridger: {
    src: "../assets/mouth-vbridger.gif",
    alt: "VBridger 입 움직임 샘플",
    label: "Advanced Option",
    title: "VBridger 대응",
    desc: "넓은 발화 범위와 더 풍부한 입 모양 변화를 고려한 옵션입니다.",
    plan: "프리미엄 LD + 옵션",
    use: "발화 표현을 세밀하게 쓰고 싶은 경우",
  },
  eyes: {
    src: "../assets/eyes-odd.gif",
    alt: "눈 물리 샘플",
    label: "Premium LD",
    title: "눈동자와 속눈썹 물리",
    desc: "눈빛과 작은 시선 변화로 캐릭터의 생동감을 더합니다.",
    plan: "프리미엄 LD",
    use: "눈빛, 하이라이트, 페이셜 디테일이 중요할 때",
  },
  body: {
    src: "../assets/body-z.gif",
    alt: "Z축 움직임 샘플",
    label: "Basic / Premium",
    title: "XYZ 기본 축",
    desc: "얼굴과 몸의 X/Y/Z 움직임은 LD 리깅의 기본 체감 품질을 결정합니다.",
    plan: "베이직 LD 이상",
    use: "전신 모델의 입체감과 자연스러운 고개 움직임이 필요할 때",
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
