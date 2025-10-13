// assets/js/app.js  (HOME - SOLO PÚBLICO)
import { $ } from './dom.js';
import { loadRelease } from './release.js';
import { initNewsletter } from './newsletter.js';
import { initBackgroundParallax } from './bg.js';
import { initCountdown } from './countdown.js';

$('#year').textContent = new Date().getFullYear();

initBackgroundParallax();
initNewsletter();

// Carga la fecha (si loadRelease la devuelve) y arranca el contador.
// Si no, el contador observará #release-meta hasta que aparezca la fecha.
(async () => {
  let info = null;
  try {
    // Ideal que retorne { releaseDate: 'YYYY-MM-DDTHH:mm:ss±HH:mm' }
    info = await loadRelease();
  } catch (_) {}

  const el = document.querySelector('#release-meta');
  const fromDataset = el?.dataset?.releaseIso || el?.getAttribute?.('data-release-iso') || null;

  const maybeDate =
    (info && (info.releaseDate || info.date || info.release_at || info.releaseISO)) ||
    fromDataset ||
    null;

  initCountdown(maybeDate);
})();
