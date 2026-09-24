(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const locale = document.documentElement.lang.startsWith('ja') ? 'ja' : document.documentElement.lang.startsWith('en') ? 'en' : 'ko';
  const normalize = path => '/' + path.split('/').filter(Boolean).filter((part, index) => !(index === 0 && ['en', 'ja'].includes(part)) && part !== 'index.html').join('/');
  const current = normalize(location.pathname);
  header.querySelectorAll('.top-nav a').forEach(link => {
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || target.hash) return;
    const path = normalize(target.pathname);
    if (path === current) link.setAttribute('aria-current', 'page');
    else if (path !== '/' && current.startsWith(path + '/')) link.setAttribute('aria-current', 'location');
  });

  const topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'back-to-top';
  topButton.hidden = true;
  topButton.textContent = '↑';
  topButton.title = { ko: '맨 위로', en: 'Back to top', ja: 'ページ上部へ' }[locale];
  topButton.setAttribute('aria-label', topButton.title);
  document.body.append(topButton);
  topButton.addEventListener('click', () => {
    header.querySelector('.brand')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  let scheduled = false;
  const updateScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    topButton.hidden = window.scrollY < 650;
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('pageshow', updateScroll);
  updateScroll();

  // Keep a small preview until the animated sample actually enters the viewport.
  const sample = document.querySelector('[data-animated-src]');
  if (sample) {
    const loadSample = () => {
      if (!sample.dataset.animatedSrc) return;
      sample.src = sample.dataset.animatedSrc;
      delete sample.dataset.animatedSrc;
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { loadSample(); observer.disconnect(); }
      });
      observer.observe(sample);
    } else { loadSample(); }
  }

  // Preserve the existing guide behavior and expose selection/expanded panels to keyboards and readers.
  const tabs = [...document.querySelectorAll('.guide-tab')];
  const syncTabs = () => tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.classList.contains('is-active'))));
  tabs.forEach(tab => tab.addEventListener('click', syncTabs));
  syncTabs();
  document.querySelectorAll('.notice-accordion button').forEach((button, index) => {
    const panel = button.nextElementSibling;
    if (!panel) return;
    if (!panel.id) panel.id = `guide-answer-${index}`;
    button.setAttribute('aria-controls', panel.id);
  });
})();
