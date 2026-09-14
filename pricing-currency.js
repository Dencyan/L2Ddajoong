(() => {
  // Fixed rates requested by the owner; all source prices and discount arithmetic stay in KRW.
  // EN: KRW 1,500 = USD 1. JP: KRW 1,000 = JPY 100.
  const locale = document.documentElement.lang.startsWith('ja') ? 'ja'
    : document.documentElement.lang.startsWith('en') ? 'en' : 'ko';
  const settings = {
    ko: { code: 'KRW', symbol: '₩', unit: '원', divisor: 1, digits: 0, intl: 'ko-KR', note: '' },
    en: { code: 'USD', symbol: '$', unit: 'USD', divisor: 1500, digits: 2, intl: 'en-US', note: 'Prices in USD at a fixed rate of USD 1 = KRW 1,500. Estimates are converted after totaling and rounded to the nearest cent.' },
    ja: { code: 'JPY', symbol: '¥', unit: '円', divisor: 10, digits: 0, intl: 'ja-JP', note: '料金は日本円表示です（固定換算：100円＝1,000ウォン）。見積りは合計後に換算し、1円単位で四捨五入します。' },
  }[locale];
  const formatter = new Intl.NumberFormat(settings.intl, {
    minimumFractionDigits: settings.digits, maximumFractionDigits: settings.digits,
  });
  const number = krw => formatter.format(Math.max(0, krw) / settings.divisor);
  const format = krw => locale === 'en' ? `US$${number(krw)}` : `${number(krw)}${settings.unit}`;
  window.DajoongMoney = Object.freeze({ ...settings, locale, number, format });
  // Localized HTML includes converted fallback text for visitors without JavaScript.
  document.querySelectorAll('[data-money-krw]').forEach(element => {
    element.textContent = format(Number(element.dataset.moneyKrw));
  });
  document.querySelectorAll('[data-currency-note]').forEach(element => {
    element.textContent = settings.note;
  });
})();
