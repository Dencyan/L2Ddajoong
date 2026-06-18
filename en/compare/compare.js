const compareData = {
  "mouth-basic": {
    src: "../assets/mouth-9.gif",
    alt: "9-point Mouth Movement Sample",
    label: "Basic LD",
    title: "9-point Mouth Movement",
    desc: "A mouth structure suited to casual conversation and standard streaming.",
    plan: "Basic LD",
    use: "Clean speech and stable core movement",
  },
  "mouth-premium": {
    src: "../assets/mouth-12.gif",
    alt: "12-point Mouth Movement Sample",
    label: "Premium LD",
    title: "12-point Mouth Movement",
    desc: "A detailed mouth structure for richer dialogue and emotional expression.",
    plan: "Premium LD",
    use: "Models with frequent dialogue and expressive performance",
  },
  vbridger: {
    src: "../assets/mouth-vbridger.gif",
    alt: "VBridger Mouth Movement Sample",
    label: "Advanced Option",
    title: "VBridger Support",
    desc: "An option designed for a wider speech range and richer mouth shapes.",
    plan: "Premium LD + Option",
    use: "Detailed speech expression",
  },
  eyes: {
    src: "../assets/eyes-odd.gif",
    alt: "Eye Physics Sample",
    label: "Premium LD",
    title: "Iris and Eyelash Physics",
    desc: "Eye highlights and subtle gaze changes make the character feel more alive.",
    plan: "Premium LD",
    use: "When gaze, highlights, and facial detail matter",
  },
  body: {
    src: "../assets/body-z.gif",
    alt: "Z-axis Motion Sample",
    label: "Basic / Premium",
    title: "Core XYZ Axes",
    desc: "Face and body XYZ movement defines the core feel of LD rigging.",
    plan: "Basic LD or Higher",
    use: "Full-body depth and natural head movement",
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
