(() => {
  const form = document.querySelector("[data-contact-form]");
  const status = form?.querySelector("[data-form-status]");
  const submit = form?.querySelector("button[type='submit']");
  if (!form || !status || !submit) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    submit.disabled = true;
    form.classList.add("is-sending");
    status.className = "form-status";
    status.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);

      form.reset();
      status.classList.add("is-success");
      status.textContent = form.dataset.success;
    } catch (error) {
      status.classList.add("is-error");
      status.textContent = form.dataset.error;
      console.error(error);
    } finally {
      submit.disabled = false;
      form.classList.remove("is-sending");
      status.focus?.();
    }
  });
})();
