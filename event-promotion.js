(() => {
  // === DAJOONG_POPUP_EVENT START: 5만 원 팝업 문의 이벤트 ===
  // 종료 방법: enabled를 false로 변경하면 팝업/가격 할인/견적 이벤트/문의 태그가 모두 꺼집니다.
  // 자동 종료: endsAt에 한국 시간 포함 ISO 날짜 입력. 예: '2026-12-31T23:59:59+09:00'
  // 현재 합의된 조건: 종료일 없음(null), 기존 할인과 중복 불가.
  const EVENT_CONFIG = {
    enabled: true,
    endsAt: null,
  };
  window.DajoongEvent = null;
  const deadline = EVENT_CONFIG.endsAt === null ? Infinity : Date.parse(EVENT_CONFIG.endsAt);
  if (!EVENT_CONFIG.enabled || !(Date.now() < deadline)) return;
  const id = 'popup-inquiry-50000';
  const amount = 50000;
  const locale = document.documentElement.lang.startsWith('ja') ? 'ja' : document.documentElement.lang.startsWith('en') ? 'en' : 'ko';
  const copy = {
    ko: { title: '팝업으로 문의하고 5만 원 할인받으세요', badge: '문의 할인 이벤트', detail: '이 팝업의 문의 버튼으로 접수하면 의뢰 총액에서 50,000원을 할인해 드립니다.', terms: '의뢰 1건당 1회 적용 · 기존 할인과 중복 불가 · 종료일 없음. 추가 옵션마다 각각 할인되는 이벤트는 아닙니다.', cta: '5만 원 할인받고 문의하기', close: '닫기', open: '5만 원 할인 이벤트', applied: '팝업 문의 5만 원 할인이 선택되었습니다.', price: '팝업 문의 시', option: '팝업 문의 이벤트 (50,000원 할인)', note: '팝업 문의 이벤트가 적용됩니다. 다른 할인과 중복되지 않으며 최종 금액은 상담 후 확정됩니다.' },
    en: { title: 'Get KRW 50,000 off your commission', badge: 'Inquiry offer', detail: 'Use the inquiry button in this popup to receive KRW 50,000 off your commission total.', terms: 'Once per commission. Cannot be combined with other discounts. No end date. The discount is not applied to each add-on separately.', cta: 'Get KRW 50,000 off and inquire', close: 'Close', open: 'KRW 50,000 offer', applied: 'The KRW 50,000 popup inquiry discount is selected.', price: 'Via popup inquiry', option: 'Popup inquiry offer (KRW 50,000 off)', note: 'The popup inquiry offer applies. It cannot be combined with other discounts. The final quote is confirmed after consultation.' },
    ja: { title: 'ポップアップからのご相談で50,000ウォン割引', badge: 'お問い合わせキャンペーン', detail: 'このポップアップのお問い合わせボタンからご相談いただくと、ご依頼総額から50,000ウォンを割引します。', terms: 'ご依頼1件につき1回。他の割引との併用不可。終了日なし。追加オプションごとに割引するものではありません。', cta: '50,000ウォン割引で問い合わせる', close: '閉じる', open: '50,000ウォン割引', applied: 'ポップアップお問い合わせの50,000ウォン割引が選択されています。', price: 'ポップアップからのご相談で', option: 'ポップアップお問い合わせ（50,000ウォン割引）', note: 'ポップアップお問い合わせ割引が適用されます。他の割引との併用はできません。最終金額はご相談後に確定します。' }
  }[locale];
  if (EVENT_CONFIG.endsAt !== null) {
    const end = new Date(deadline).toLocaleString(locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : 'en-GB', { timeZone: 'Asia/Seoul' });
    copy.terms = copy.terms.replace(
      locale === 'ko' ? '종료일 없음' : locale === 'ja' ? '終了日なし' : 'No end date',
      locale === 'ko' ? `${end} (한국 시간) 종료` : locale === 'ja' ? `${end} (韓国時間) 終了` : `Ends ${end} (Korea time)`
    );
  }
  document.querySelectorAll('[data-event-only]').forEach(element => { element.hidden = false; });
  const read = key => { try { return sessionStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { sessionStorage.setItem(key, value); } catch {} };
  const contact = `${locale === 'ko' ? '' : '/' + locale}/contact/`;
  const inquiryUrl = `${contact}?event=${id}`;
  const requested = new URLSearchParams(location.search).get('event') === id;
  if (requested) write(id + ':claimed', '1');
  const query = new URLSearchParams(location.search);
  const explicitOtherDiscount = ['none', 'collab', 'review'].includes(query.get('discount'));
  const claimed = !explicitOtherDiscount && (requested || read(id + ':claimed') === '1');
  const money = n => locale === 'ko' ? `${n.toLocaleString('ko-KR')}원` : locale === 'ja' ? `${n.toLocaleString('ja-JP')}ウォン` : `KRW ${n.toLocaleString('en-US')}`;

  const dialog = document.createElement('dialog');
  dialog.className = 'event-dialog';
  dialog.setAttribute('aria-labelledby', 'event-title');
  const poster = {
    ko: { title: 'Live2D 커미션', subtitle: '문의 할인 이벤트', unit: '원', discount: '의뢰 총액 할인', today: '오늘 하루 열지 않기', storageError: '숨김 설정을 저장할 수 없습니다. 브라우저의 사이트 저장 설정을 확인해 주세요.' },
    en: { title: 'Live2D commission', subtitle: 'An offer for your inquiry', unit: 'KRW', discount: 'OFF YOUR COMMISSION TOTAL', today: "Don’t show again today", storageError: 'Your preference could not be saved. Please check your browser’s site storage settings.' },
    ja: { title: 'Live2Dコミッション', subtitle: 'お問い合わせキャンペーン', unit: 'ウォン', discount: 'ご依頼総額から割引', today: '今日は表示しない', storageError: '設定を保存できませんでした。ブラウザのサイト保存設定をご確認ください。' }
  }[locale];
  dialog.setAttribute('aria-describedby', 'event-detail');
  dialog.innerHTML = `<div class="event-poster"><div class="event-masthead"><span>DAJOONG</span><span>LIVE2D / COMMISSION</span></div><h2 id="event-title">${poster.title}<span>${poster.subtitle}</span></h2><div class="event-coupon"><p>${poster.discount}</p><div class="event-amount">50,000<span>${poster.unit}</span></div><div class="event-coupon-foot"><span>INQUIRY OFFER</span><span>DAJOONG</span></div></div><p id="event-detail">${copy.detail}</p><a class="event-cta" href="${inquiryUrl}">${copy.cta}<span aria-hidden="true">→</span></a><p class="event-storage-error" role="status" hidden>${poster.storageError}</p></div><div class="event-controls"><button type="button" class="event-hide-today">${poster.today}</button><button type="button" class="event-close">${copy.close}<span aria-hidden="true">×</span></button></div>`;
  // DAJOONG_POPUP_EVENT: only this preference suppresses automatic display.
  // Midnight is evaluated in Korea time, and the preference is shared across tabs/locales.
  const hideKey = id + ':hidden-until';
  const nextKoreaMidnight = () => {
    const korea = new Date(Date.now() + 9 * 60 * 60 * 1000);
    return Date.UTC(korea.getUTCFullYear(), korea.getUTCMonth(), korea.getUTCDate() + 1) - 9 * 60 * 60 * 1000;
  };
  const hiddenToday = () => {
    try {
      const until = Number(localStorage.getItem(hideKey));
      return Number.isFinite(until) && Date.now() < until && until <= nextKoreaMidnight();
    } catch { return false; }
  };
  document.body.append(dialog);
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'event-trigger';
  trigger.textContent = copy.open;
  trigger.setAttribute('aria-haspopup', 'dialog');
  document.body.append(trigger);
  let returnFocus;
  function open() {
    if (dialog.open) return;
    returnFocus = document.activeElement;
    dialog.querySelector('.event-storage-error').hidden = true;
    dialog.showModal();
    document.body.classList.add('event-is-open');
  }
  dialog.querySelector('.event-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.event-hide-today').addEventListener('click', () => {
    try {
      localStorage.setItem(hideKey, String(nextKoreaMidnight()));
      dialog.close();
    } catch {
      dialog.querySelector('.event-storage-error').hidden = false;
    }
  });
  dialog.querySelector('a').addEventListener('click', () => write(id + ':claimed', '1'));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('event-is-open');
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  trigger.addEventListener('click', open);

  document.querySelectorAll('[data-event-base-price]').forEach(element => {
    const base = Number(element.dataset.eventBasePrice);
    if (!Number.isFinite(base) || base < amount) return;
    const line = document.createElement('span');
    line.className = 'event-price';
    line.textContent = `${copy.price} ${money(base - amount)}${element.dataset.eventStarting === 'true' ? '~' : ''}`;
    element.append(line);
  });
  const priceSection = document.querySelector('.price-reference');
  if (priceSection) {
    const info = document.createElement('div');
    info.className = 'event-price-note';
    const text = document.createElement('p');
    text.textContent = `${copy.detail} ${copy.terms}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = copy.open;
    button.addEventListener('click', open);
    info.append(text, button);
    priceSection.prepend(info);
  }
  const form = document.querySelector('[data-contact-form]');
  if (form && claimed) {
    const notice = document.createElement('div');
    notice.className = 'event-applied';
    notice.textContent = copy.applied;
    form.prepend(notice);
    for (const [name, value] of Object.entries({ promotion_id: id, promotion_discount_krw: String(amount), promotion_source: 'popup_inquiry', promotion_stacking: 'not_allowed' })) {
      const field = document.createElement('input');
      field.type = 'hidden'; field.name = name; field.setAttribute('value', value);
      form.append(field);
    }
  }
  window.DajoongEvent = { id, amount, claimed, inquiryUrl, copy, open };
  // The inquiry CTA lands directly on the form without another interruption.
  // Closing or claiming an offer does not suppress future visits/reloads.
  if (!hiddenToday() && !(form && requested)) open();
  // === DAJOONG_POPUP_EVENT END ===
})();
