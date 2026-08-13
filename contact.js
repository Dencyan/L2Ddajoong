(() => {
  const form = document.querySelector("[data-contact-form]");
  const status = form?.querySelector("[data-form-status]");
  const submit = form?.querySelector("button[type='submit']");
  const turnstileField = form?.querySelector("[data-turnstile-field]");
  const turnstileWidget = form?.querySelector("[data-turnstile-widget]");
  if (!form || !status || !submit) return;

  const siteKey = String(window.DAJOONG_TURNSTILE_SITE_KEY || "").trim();
  const turnstileEnabled = Boolean(siteKey && turnstileField && turnstileWidget);
  let turnstileToken = "";
  let widgetId = null;

  const showStatus = (type, message) => {
    status.className = `form-status is-${type}`;
    status.textContent = message;
    status.focus();
  };

  const clearStatus = () => {
    status.className = "form-status";
    status.textContent = "";
  };

  const syncSubmitState = () => {
    if (!form.classList.contains("is-sending")) {
      submit.disabled = turnstileEnabled && !turnstileToken;
    }
  };

  const loadTurnstile = () => {
    if (window.turnstile) return Promise.resolve(window.turnstile);

    return new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-dajoong-turnstile]");
      const handleLoad = () => {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error("Turnstile API did not initialize"));
      };
      const handleError = () => reject(new Error("Turnstile API failed to load"));

      if (existing) {
        existing.addEventListener("load", handleLoad, { once: true });
        existing.addEventListener("error", handleError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.dajoongTurnstile = "";
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
      document.head.append(script);
    });
  };

  const resetTurnstile = () => {
    turnstileToken = "";
    if (widgetId !== null && window.turnstile) {
      window.turnstile.reset(widgetId);
    }
    syncSubmitState();
  };

  if (turnstileEnabled) {
    turnstileField.hidden = false;
    syncSubmitState();

    loadTurnstile()
      .then((turnstile) => {
        const widgetSize = turnstileWidget.getBoundingClientRect().width < 300
          ? "compact"
          : "flexible";

        widgetId = turnstile.render(turnstileWidget, {
          sitekey: siteKey,
          action: "contact",
          appearance: "always",
          language: document.documentElement.lang || "auto",
          size: widgetSize,
          theme: "auto",
          callback: (token) => {
            turnstileToken = token;
            if (status.dataset.captchaStatus === "true") clearStatus();
            delete status.dataset.captchaStatus;
            syncSubmitState();
          },
          "expired-callback": () => {
            turnstileToken = "";
            status.dataset.captchaStatus = "true";
            showStatus("error", form.dataset.captchaExpired);
            syncSubmitState();
          },
          "error-callback": () => {
            turnstileToken = "";
            status.dataset.captchaStatus = "true";
            showStatus("error", form.dataset.captchaError);
            syncSubmitState();
          },
        });
      })
      .catch((error) => {
        status.dataset.captchaStatus = "true";
        showStatus("error", form.dataset.captchaError);
        submit.disabled = true;
        console.error(error);
      });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    if (turnstileEnabled && !turnstileToken) {
      status.dataset.captchaStatus = "true";
      showStatus("error", form.dataset.captchaRequired);
      return;
    }

    submit.disabled = true;
    form.classList.add("is-sending");
    clearStatus();

    try {
      const formData = new FormData(form);
      if (turnstileEnabled) {
        formData.set("cf-turnstile-response", turnstileToken);
      }

      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      form.reset();
      if (turnstileEnabled) resetTurnstile();
      showStatus("success", form.dataset.success);
    } catch (error) {
      if (turnstileEnabled) resetTurnstile();
      showStatus("error", form.dataset.error);
      console.error(error);
    } finally {
      form.classList.remove("is-sending");
      syncSubmitState();
    }
  });
})();
