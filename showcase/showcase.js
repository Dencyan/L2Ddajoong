/* ====================================================================
   
   🎬 Dajoong Live2D Portfolio - Slider Script
   
   이 코드는 Live2D Rigger "다중(Dajoong)"이 작성했습니다.
   
   수정 사항이나 개선 아이디어가 있으시다면 편하게 DM 보내주세요!
   개선에 협력해주셔서 감사합니다! 🙏
   
   👤 Contact:
   • X (Twitter): https://x.com/_Dajoong
   • Foriio: https://www.foriio.com/DaJoong
   • YouTube: https://www.youtube.com/@Dajoong_L2d
   
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ====================================================================
     1. 데이터 정의
     카테고리별 YouTube 비디오 ID 목록 정의
     ===================================================================== */
  const videoData = {
    LD: { title: "LD", list: ["8EabRx_ZFAI", "wML53bUKn1Q", "yvc0yN8uwqU", "w-eRgLmsgas", "zKRPxZ7pv58", ] },
    SD: { title: "SD", list: ["bdD1dhv6lI4", "BtvMd8yG80g", "SwGP1UFE424", "pH4GRAjcp2U", "b6DNOVjED9o"] },
    FAN: { title: "오너캐", list: ["cOmUiWxkqfo", "FzIi9m1bKeI", "9XtIUiv314c"] },
    MEM: { title: "메모리얼", list: ["JLTUyPkfsj0", "lhVUjv1q-bw"] }
  };

  /* ====================================================================
     2. HTML 자동 생성
     버튼, 섹션, 슬라이더를 동적으로 생성
     ===================================================================== */
  function buildAllTypes() {
    const typeButtons = document.querySelector("[data-type-buttons]");
    const container = document.getElementById("type-container");

    typeButtons.innerHTML = "";
    container.innerHTML = "";

    let typeKeys = Object.keys(videoData);

    typeKeys.forEach((typeKey, idx) => {
      const item = videoData[typeKey];

      // 각 타입별 탭 버튼 생성
      const btn = document.createElement("button");
      btn.textContent = item.title;
      btn.setAttribute("data-switch", typeKey);
      if (idx === 0) btn.setAttribute("data-active", "true");
      typeButtons.appendChild(btn);

      // 각 타입별 슬라이더 섹션 생성
      const sec = document.createElement("section");
      sec.setAttribute("data-type", typeKey);
      if (idx === 0) sec.setAttribute("data-active", "true");

      sec.innerHTML = generateSliderHTML(item.list);
      container.appendChild(sec);
    });
  }

  /* ====================================================================
     3. 슬라이더 HTML 템플릿 생성
     활성 슬라이드는 src로 직접 로드, 비활성은 data-src로 lazy loading
     ===================================================================== */
  function generateSliderHTML(list) {
    let slides = "";
    list.forEach((vid, i) => {
      const isActive = i === 0;
      if (isActive) {
        // 활성 슬라이드: src 직접 로드 (처음 보이는 영상)
        slides += `
        <div data-slide data-video="${vid}" data-index="${i}" data-active="true">
          <div class="video-wrapper">
            <div class="image-placeholder hidden" data-clickable="true">Loading…</div>
            <iframe title="Video ${vid}" src="https://www.youtube.com/embed/${vid}?fs=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        </div>`;
      } else {
        // 비활성 슬라이드: data-src로 lazy loading (나중에 필요할 때 로드)
        slides += `
        <div data-slide data-video="${vid}" data-index="${i}" data-active="false">
          <div class="video-wrapper">
            <div class="image-placeholder" data-clickable="true">Loading…</div>
            <iframe class="lazy-iframe" title="Video ${vid}" data-src="https://www.youtube.com/embed/${vid}?fs=0" src="about:blank" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        </div>`;
      }
    });

    let thumbs = "";
    list.forEach((vid, i) => {
      thumbs += `
        <button data-thumb data-index="${i}" ${i===0 ? 'data-active="true"' : ''}>
          <img src="https://img.youtube.com/vi/${vid}/hqdefault.jpg" alt="Thumbnail ${i+1}">
        </button>`;
    });

    return `
      <div data-root>
        <div data-stage aria-roledescription="carousel" data-autoplay="false" data-interval="6000">
          ${slides}
          <button data-action="prev">❮</button>
          <button data-action="next">❯</button>
        </div>

        <div data-dots></div>

        <div data-thumbs-wrapper>
          <div data-thumbs>${thumbs}</div>
        </div>
      </div>`;
  }

  /* ====================================================================
     4. 초기 실행
     DOM에 슬라이더 생성
     ===================================================================== */
  buildAllTypes();

  /* ====================================================================
     5. Iframe 로딩 헬퍼 함수
     data-src 속성을 가진 iframe을 src로 로드하는 함수
     ===================================================================== */
  function loadIframe(wrapper) {
    const iframe = wrapper.querySelector('iframe[data-src]');
    const ph = wrapper.querySelector('.image-placeholder');
    
    if (iframe && iframe.dataset.src) {
      iframe.src = iframe.dataset.src;
      iframe.addEventListener('load', () => { 
        if (ph) ph.classList.add('hidden'); 
      }, { once: true });
      iframe.removeAttribute('data-src');
      iframe.classList.remove('lazy-iframe');
      return true;
    }
    return false;
  }

  /* ====================================================================
     6. Lazy Loading 초기화
     - 활성 슬라이드 즉시 로드
     - IntersectionObserver로 뷰포트 진입 시 로드
     - Placeholder/Wrapper 클릭 시 로드
     ===================================================================== */
  function initLazyIframes() {
    const allSlides = document.querySelectorAll('[data-slide]');
    
    // 첫 번째 활성 영상은 즉시 로드 (사용자가 바로 보는 영상)
    const activeSlide = document.querySelector('[data-slide][data-active="true"]');
    if (activeSlide) {
      const wrapper = activeSlide.querySelector('.video-wrapper');
      if (wrapper) loadIframe(wrapper);
    }

    // IntersectionObserver: 슬라이드가 뷰포트에 들어오면 자동 로드
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const slide = entry.target;
            const wrapper = slide.querySelector('.video-wrapper');
            if (wrapper && loadIframe(wrapper)) {
              observer.unobserve(slide);
            }
          }
        });
      }, { rootMargin: '300px 0px' });

      allSlides.forEach(slide => observer.observe(slide));
    }

    // Placeholder 클릭 시 로드 (placeholder만 반응)
    allSlides.forEach(slide => {
      const placeholder = slide.querySelector('.image-placeholder');
      if (placeholder) {
        placeholder.addEventListener('click', (e) => {
          e.stopPropagation();
          const wrapper = slide.querySelector('.video-wrapper');
          if (wrapper) loadIframe(wrapper);
        });
      }
    });

    // Wrapper 클릭도 반응 (이미 로드된 iframe 클릭 시)
    allSlides.forEach(slide => {
      const wrapper = slide.querySelector('.video-wrapper');
      if (wrapper) {
        wrapper.addEventListener('click', (e) => {
          // placeholder가 아닐 때만 처리 (placeholder는 위에서 이미 처리됨)
          if (e.target !== slide.querySelector('.image-placeholder')) {
            // iframe을 클릭한 경우 YouTube 플레이어가 자동으로 처리함
            return;
          }
        }, { passive: true });
      }
    });
  }

  initLazyIframes();

  /* ====================================================================
     7. 타입 전환 로직
     카테고리 탭 클릭 시 해당 슬라이더로 전환
     ===================================================================== */
  const typeButtons = document.querySelectorAll('[data-type-buttons] button');
  const typeSections = document.querySelectorAll('section[data-type]');

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-switch');

      // 모든 버튼의 활성 상태 제거 후 클릭한 버튼만 활성화
      typeButtons.forEach(b => b.removeAttribute('data-active'));
      btn.setAttribute('data-active', 'true');

      // 해당 타입의 섹션만 표시
      typeSections.forEach(sec => {
        if (sec.getAttribute('data-type') === target)
          sec.setAttribute('data-active', 'true');
        else
          sec.removeAttribute('data-active');
      });

      // 타입 전환 후 활성 슬라이드의 iframe 로드 보장
      setTimeout(() => { 
        const activeSlide = document.querySelector('section[data-type][data-active="true"] [data-slide][data-active="true"]');
        if (activeSlide) {
          const iframe = activeSlide.querySelector('iframe[data-src]');
          const ph = activeSlide.querySelector('.image-placeholder');
          if (iframe && iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
            if (ph) ph.classList.add('hidden');
          }
        }
        window.dispatchEvent(new Event('resize')); 
      }, 10);
    });
  });

  /* ====================================================================
     8. 슬라이더 코어 로직
     각 슬라이더의 네비게이션, 상태 관리, 자동재생 처리
     ===================================================================== */
  (function() {
    const roots = document.querySelectorAll('div[data-root]');

    roots.forEach(root => {
      const stage = root.querySelector('div[data-stage]');
      const slides = Array.from(stage.querySelectorAll('div[data-slide]'));
      const prevBtn = stage.querySelector('button[data-action="prev"]');
      const nextBtn = stage.querySelector('button[data-action="next"]');
      const dotsWrap = root.querySelector('div[data-dots]');
      const thumbs = root.querySelector('div[data-thumbs]');
      const thumbButtons = Array.from(thumbs.querySelectorAll('button[data-thumb]'));

      // 현재 활성 슬라이드 인덱스
      let current = slides.find(s => s.getAttribute('data-active') === 'true')
        ?.getAttribute('data-index') || 0;
      current = Number(current);
      const total = slides.length;

      // 자동재생 설정
      let autoplay = stage.getAttribute('data-autoplay') === 'true';
      let interval = parseInt(stage.getAttribute('data-interval') || '5000', 10);
      let timer = null;

      /* -------- 도트 네비게이션 빌드 -------- */
      function buildDots() {
        dotsWrap.innerHTML = '';
        for (let i = 0; i < total; i++) {
          const b = document.createElement('button');
          b.setAttribute('data-dot', '');
          if (i === current) b.setAttribute('data-active', 'true');
          b.addEventListener('click', () => goTo(i));
          dotsWrap.appendChild(b);
        }
      }

      /* -------- UI 업데이트 (슬라이드, 도트, 썸네일 활성 상태) -------- */
      function updateUI() {
        // 슬라이드 활성 상태 업데이트
        slides.forEach(s => {
          const idx = Number(s.getAttribute('data-index'));
          const active = idx === current;
          s.setAttribute('data-active', active ? 'true' : 'false');
          s.setAttribute('aria-hidden', active ? 'false' : 'true');
        });

        // 도트 활성 상태 업데이트
        const dotBtns = dotsWrap.querySelectorAll('button[data-dot]');
        dotBtns.forEach((d, i) => {
          if (i === current) d.setAttribute('data-active', 'true');
          else d.removeAttribute('data-active');
        });

        // 썸네일 활성 상태 업데이트
        thumbButtons.forEach((t, i) => {
          if (i === current) t.setAttribute('data-active', 'true');
          else t.removeAttribute('data-active');
        });

        // 활성 슬라이드의 iframe을 자동 로드
        const activeSlide = slides.find(s => Number(s.getAttribute('data-index')) === current);
        if (activeSlide) {
          const wrapper = activeSlide.querySelector('.video-wrapper');
          if (wrapper) loadIframe(wrapper);
        }
      }

      /* -------- 슬라이드 이동 함수 -------- */
      function goTo(i) {
        if (i < 0) i = total - 1;  // 배열 범위 오버플로우 방지 (처음으로 돌아가기)
        if (i >= total) i = 0;     // 배열 범위 오버플로우 방지 (끝에서 처음으로)
        current = i;
        updateUI();
        resetAutoplay();
      }

      function prev() { goTo(current - 1); }
      function next() { goTo(current + 1); }

      /* -------- 이벤트 리스너: 썸네일 클릭 -------- */
      // capture phase에서 먼저 처리해 이벤트 전파 방지
      thumbButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const idx = Number(btn.getAttribute('data-index'));
          goTo(idx);
        }, true);
      });

      /* -------- 이벤트 리스너: 이전/다음 버튼 클릭 -------- */
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prev();
      });

      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        next();
      });

      /* -------- 이벤트 리스너: 키보드 화살표 키 -------- */
      window.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      });

      /* -------- 자동재생 관리 -------- */
      function startAutoplay() {
        if (!autoplay) return;
        stopAutoplay();
        timer = setInterval(() => next(), interval);
      }

      function stopAutoplay() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      /* -------- 슬라이더 초기화 -------- */
      buildDots();
      updateUI();
      startAutoplay();
    });
  })();

});
