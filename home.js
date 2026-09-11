(() => {
  'use strict';
  const copy = window.DAJOONG_HOME_COPY;
  const samples = window.DAJOONG_SAMPLES;
  if (!copy || !samples) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage = document.querySelector('#model-stage');
  const mount = document.querySelector('#model-mount');
  const start = document.querySelector('[data-demo-start]');
  const stop = document.querySelector('[data-demo-stop]');
  const status = document.querySelector('#demo-status');
  const controls = document.querySelector('#demo-controls');
  const buttons = [...document.querySelectorAll('[data-home-live2d-control]')];
  const demoURL = 'https://dajoongsitemodel.netlify.app/?embed=compact';
  const origin = new URL(demoURL).origin;
  let frame = null;
  let timeout = null;
  let state = 'idle';
  let startingFocus = null;

  function setState(next) {
    state = next;
    stage.dataset.state = next;
    stage.setAttribute('aria-busy', String(next === 'loading'));
    status.textContent = copy[next === 'idle' ? 'static' : next];
    start.textContent = next === 'error' ? copy.retry : copy.try;
    start.setAttribute('aria-disabled', String(next === 'loading'));
    controls.hidden = next !== 'ready';
    stop.hidden = next === 'idle';
    buttons.forEach(button => { button.disabled = next !== 'ready'; });
    if (frame) {
      frame.setAttribute('aria-hidden', String(next !== 'ready'));
      frame.tabIndex = next === 'ready' ? 0 : -1;
    }
  }
  function discardFrame() {
    clearTimeout(timeout);
    frame?.remove();
    frame = null;
    buttons.forEach(button => {
      button.classList.remove('is-active');
      button.setAttribute('aria-pressed', 'false');
      button.textContent = button.dataset.defaultLabel;
    });
  }
  function fail() {
    discardFrame();
    setState('error');
  }
  start.addEventListener('click', event => {
    event.preventDefault();
    if (state === 'loading') return;
    if (state === 'ready') { buttons[0]?.focus(); return; }
    discardFrame();
    startingFocus = document.activeElement;
    frame = document.createElement('iframe');
    frame.id = 'home-demo-frame';
    frame.title = 'Dajoong Live2D rigging demo';
    frame.allow = 'clipboard-write';
    frame.addEventListener('error', fail, { once: true });
    setState('loading');
    frame.src = demoURL;
    mount.append(frame);
    timeout = window.setTimeout(fail, 20000);
  });
  stop.addEventListener('click', () => { discardFrame(); setState('idle'); start.focus(); });
  buttons.forEach(button => {
    button.dataset.defaultLabel = button.textContent;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (state !== 'ready' || !frame?.contentWindow) return;
      frame.contentWindow.postMessage({ type: 'dajoong-live2d-control', id: button.dataset.homeLive2dControl }, origin);
    });
  });
  window.addEventListener('message', event => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== origin) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'dajoong-live2d-ready') {
      // The embedded demo announces ready:false while textures are loading.
      if (!data.ready) return;
      clearTimeout(timeout);
      setState('ready');
      if (document.activeElement === startingFocus) buttons[0]?.focus();
    }
    if (data.type === 'dajoong-live2d-control-state') {
      const button = buttons.find(item => item.dataset.homeLive2dControl === data.id);
      if (!button) return;
      button.classList.toggle('is-active', Boolean(data.active));
      button.setAttribute('aria-pressed', String(Boolean(data.active)));
      if (data.id === 'face-zoom') {
        const label = document.documentElement.lang === 'ko' ? '전체 보기' : document.documentElement.lang === 'ja' ? '全体表示' : 'Full view';
        button.textContent = data.active ? label : button.dataset.defaultLabel;
      }
    }
  });

  const sampleImage = document.querySelector('#sample-image');
  const sampleButtons = [...document.querySelectorAll('[data-sample]')];
  const samplePlay = document.querySelector('#sample-play');
  const sampleStatus = document.querySelector('#sample-status');
  let selected = 'body-x';
  let playing = false;
  let version = 0;
  function poster(item) { return item.src.replace('/assets/', '/assets/thumbs/').replace('.gif', '.jpg'); }
  function renderSample(animate) {
    const item = samples[selected];
    const token = ++version;
    playing = animate;
    samplePlay.textContent = animate ? copy.pause : copy.play;
    samplePlay.setAttribute('aria-pressed', String(animate));
    sampleButtons.forEach(button => {
      const active = button.dataset.sample === selected;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelector('#sample-kind').textContent = item.kind;
    document.querySelector('#sample-title').textContent = item.title;
    document.querySelector('#sample-desc').textContent = item.desc;
    sampleStatus.textContent = '';
    const preview = new Image();
    preview.onload = () => {
      if (token !== version) return;
      sampleImage.src = preview.src;
      sampleImage.alt = item.alt;
    };
    preview.onerror = () => {
      if (token !== version) return;
      playing = false;
      samplePlay.textContent = copy.play;
      samplePlay.setAttribute('aria-pressed', 'false');
      sampleStatus.textContent = copy.sampleError;
      sampleImage.src = poster(item);
      sampleImage.alt = item.alt;
    };
    preview.src = animate ? item.src : poster(item);
  }
  sampleButtons.forEach(button => {
    button.disabled = false;
    button.setAttribute('aria-pressed', String(button.dataset.sample === selected));
    button.addEventListener('click', () => { selected = button.dataset.sample; renderSample(!reduced.matches); });
  });
  samplePlay.disabled = false;
  samplePlay.setAttribute('aria-pressed', 'false');
  samplePlay.addEventListener('click', () => renderSample(!playing));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        if (!reduced.matches) renderSample(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(sampleImage);
  }
  reduced.addEventListener('change', () => { if (reduced.matches) renderSample(false); });

  let activeVideo = null;
  document.querySelectorAll('.video-preview').forEach(preview => {
    const play = preview.querySelector('button');
    const note = preview.closest('article').querySelector('[role="status"]');
    play.disabled = false;
    play.addEventListener('click', () => {
      activeVideo?.();
      const video = document.createElement('iframe');
      const id = preview.dataset.videoId;
      let timer;
      const reset = () => {
        clearTimeout(timer);
        video.remove();
        play.hidden = false;
        preview.classList.remove('is-playing');
        note.textContent = '';
      };
      const error = () => { reset(); note.textContent = copy.videoError; };
      video.title = preview.dataset.videoTitle;
      video.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      video.allowFullscreen = true;
      video.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      video.addEventListener('load', () => { clearTimeout(timer); note.textContent = ''; });
      video.addEventListener('error', error, { once: true });
      note.textContent = copy.videoWait;
      play.hidden = true;
      preview.classList.add('is-playing');
      preview.append(video);
      video.focus();
      activeVideo = reset;
      timer = window.setTimeout(error, 15000);
    });
  });
})();
