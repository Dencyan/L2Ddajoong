(() => {
  const header = document.querySelector(".site-header");
  const action = header?.querySelector(".nav-action");
  if (!header || !action) return;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const locale = parts[0] === "en" || parts[0] === "ja" ? parts.shift() : "ko";
  const pathParts = parts.filter((part) => part.toLowerCase() !== "index.html");
  const query = new URLSearchParams(window.location.search);
  const context = new URLSearchParams();
  if (query.get('event') === 'popup-inquiry-50000') context.set('event', query.get('event'));
  if (['none', 'collab', 'review'].includes(query.get('discount'))) context.set('discount', query.get('discount'));
  const syncHeaderOffset = () => document.documentElement.style.setProperty('--header-offset', `${Math.ceil(header.getBoundingClientRect().height) + 16}px`);
  new ResizeObserver(syncHeaderOffset).observe(header);
  const labels = { ko: "언어 선택", en: "Select language", ja: "言語を選択" };
  const locales = [
    { code: "ko", label: "KO", prefix: "" },
    { code: "en", label: "EN", prefix: "en" },
    { code: "ja", label: "JP", prefix: "ja" },
  ];

  const switcher = document.createElement("nav");
  switcher.className = "language-switch";
  switcher.setAttribute("aria-label", labels[locale]);

  locales.forEach((item) => {
    const link = document.createElement("a");
    const segments = [item.prefix, ...pathParts].filter(Boolean);
    link.href = `/${segments.length ? `${segments.join("/")}/` : ""}${context.size ? `?${context}` : ''}`;
    link.hreflang = item.code;
    link.lang = item.code;
    link.textContent = item.label;
    if (item.code === locale) link.setAttribute("aria-current", "page");
    switcher.append(link);
  });

  header.insertBefore(switcher, action);
})();
