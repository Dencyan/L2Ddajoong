const liveGate = document.querySelector("#live-gate");
const liveFrame = document.querySelector("#live-demo-frame");
const checkboxes = [...document.querySelectorAll(".live-checks input")];
const controlButtons = [...document.querySelectorAll("[data-live2d-control]")];
const targetOrigin = liveFrame ? new URL(liveFrame.src).origin : "";

const setControlsReady = (isReady) => {
  controlButtons.forEach((button) => {
    button.disabled = !isReady;
    button.classList.toggle("is-waiting", !isReady);
  });
};

setControlsReady(false);

liveGate?.addEventListener("click", () => {
  liveGate.classList.add("is-hidden");
  liveFrame?.focus();
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.live2dControl;
    if (!id || !liveFrame?.contentWindow || !targetOrigin) return;

    liveFrame.contentWindow.postMessage({
      type: "dajoong-live2d-control",
      id
    }, targetOrigin);

    button.classList.add("is-active");
    window.setTimeout(() => button.classList.remove("is-active"), 220);
  });
});

window.addEventListener("message", (event) => {
  if (!liveFrame?.contentWindow || event.source !== liveFrame.contentWindow || event.origin !== targetOrigin) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "dajoong-live2d-ready") {
    setControlsReady(Boolean(data.ready));
    return;
  }

  if (data.type !== "dajoong-live2d-control-state") return;
  const button = controlButtons.find((item) => item.dataset.live2dControl === data.id);
  if (!button) return;

  if (button.dataset.live2dControl === "face-zoom") {
    button.textContent = data.active ? button.dataset.resetLabel || "전체 보기" : button.dataset.defaultLabel || button.textContent;
  }
  button.classList.toggle("is-active", Boolean(data.active));
});

controlButtons.forEach((button) => {
  button.dataset.defaultLabel = button.textContent;
  if (button.dataset.live2dControl === "face-zoom") {
    if (button.textContent === "Face Zoom") button.dataset.resetLabel = "Full View";
    else if (button.textContent === "顔を拡大") button.dataset.resetLabel = "全体表示";
    else button.dataset.resetLabel = "전체 보기";
  }
});

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    checkbox.closest("label")?.classList.toggle("is-checked", checkbox.checked);
  });
});
