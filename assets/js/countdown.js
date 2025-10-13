// assets/js/countdown.js
// Contador que toma la fecha de (en orden): argumento directo, data-release-iso,
// o texto ISO en #release-meta. Muestra "¡Disponible ahora!" cuando llega a 0.

const SEC = 1000, MIN = 60 * SEC, HOUR = 60 * MIN, DAY = 24 * HOUR;

function parseDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  return null;
}

function getDateFromDOM() {
  const el = document.querySelector('#release-meta');
  if (!el) return null;

  // 1) dataset/atributo
  const iso = el.dataset.releaseIso || el.getAttribute('data-release-iso');
  const d1 = parseDate(iso);
  if (d1) return d1;

  // 2) texto ISO parseable
  const txt = (el.textContent || '').trim();
  const d2 = parseDate(txt);
  if (d2) return d2;

  return null;
}

function pad2(n) { return String(n).padStart(2, '0'); }

function render(ms) {
  const cd = document.querySelector('#countdown');
  if (!cd) return;

  if (ms <= 0) {
    cd.innerHTML = `<span class="cd-live">¡Disponible ahora!</span>`;
    cd.classList.add('live');
    return;
  }

  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  const m = Math.floor((ms % HOUR) / MIN);
  const s = Math.floor((ms % MIN) / SEC);

  cd.innerHTML = `
    <div class="cd-seg"><div class="cd-num">${pad2(d)}</div><div class="cd-lbl">días</div></div>
    <div class="cd-colon">:</div>
    <div class="cd-seg"><div class="cd-num">${pad2(h)}</div><div class="cd-lbl">hrs</div></div>
    <div class="cd-colon">:</div>
    <div class="cd-seg"><div class="cd-num">${pad2(m)}</div><div class="cd-lbl">min</div></div>
    <div class="cd-colon">:</div>
    <div class="cd-seg"><div class="cd-num">${pad2(s)}</div><div class="cd-lbl">seg</div></div>
  `;
}

let _timer = null;

export function initCountdown(dateInput) {
  let releaseDate = parseDate(dateInput) || getDateFromDOM();

  // Si aún no hay fecha (porque loadRelease escribe después), observa #release-meta
  if (!releaseDate) {
    const el = document.querySelector('#release-meta');
    if (!el) return;

    const tryStart = () => {
      const d = getDateFromDOM();
      if (d) {
        start(d);
        obs.disconnect();
      }
    };

    const obs = new MutationObserver(tryStart);
    obs.observe(el, {
      attributes: true,
      attributeFilter: ['data-release-iso'],
      childList: true,
      characterData: true,
      subtree: true
    });

    // intento inicial
    tryStart();
    return;
  }

  start(releaseDate);
}

function start(date) {
  const target = +date;

  // primer render inmediato
  render(target - Date.now());

  // intervalo a 1s
  if (_timer) clearInterval(_timer);
  _timer = setInterval(() => {
    const diff = target - Date.now();
    render(diff);
    if (diff <= 0) clearInterval(_timer);
  }, 1000);
}
