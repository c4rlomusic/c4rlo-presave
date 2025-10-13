// assets/js/release.js
import { sb } from './api.js';
import { $ } from './dom.js';

const TZ_OFFSET = '-06:00'; // CDMX (ajusta si quieres otra zona)

export async function loadRelease() {
  const wrap = $('#presave-buttons');
  const meta = document.querySelector('#release-meta');

  // --- 1) Traer el PRÓXIMO release si existe (>= hoy), si no, el último más cercano ---
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Próximos (>= hoy), orden asc
  const { data: upcoming, error: errUpcoming } = await sb
    .from('releases')
    .select('*')
    .gte('release_date', today)
    .order('release_date', { ascending: true })
    .limit(1);

  if (errUpcoming) {
    console.error(errUpcoming);
    writeEmptyUI(wrap, meta);
    return;
  }

  let r = upcoming?.[0];

  // Si no hay próximos, toma el último pasado (orden desc)
  if (!r) {
    const { data: last, error: errLast } = await sb
      .from('releases')
      .select('*')
      .lt('release_date', today)
      .order('release_date', { ascending: false })
      .limit(1);

    if (errLast) {
      console.error(errLast);
      writeEmptyUI(wrap, meta);
      return;
    }
    r = last?.[0];
  }

  if (!r) {
    writeEmptyUI(wrap, meta);
    return;
  }

  // --- 2) Botón de Presave (igual que tenías) ---
  wrap.innerHTML = '';
  const url = r.presave_urls?.universal;
  if (url) {
    const a = document.createElement('a');
    a.className = 'uiverse';
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Pre-save');
    a.innerHTML = `
      <div class="wrapper">
        <span>PRE-SAVE</span>
        <div class="circle circle-12"></div>
        <div class="circle circle-11"></div>
        <div class="circle circle-10"></div>
        <div class="circle circle-9"></div>
        <div class="circle circle-8"></div>
        <div class="circle circle-7"></div>
        <div class="circle circle-6"></div>
        <div class="circle circle-5"></div>
        <div class="circle circle-4"></div>
        <div class="circle circle-3"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-1"></div>
      </div>
    `;
    a.addEventListener('click', () => trackClick(r.id, 'universal'));
    wrap.appendChild(a);
  } else {
    wrap.innerHTML = '<p class="muted">Sin link de presave aún.</p>';
  }

  // --- 3) Fecha visible + data-release-iso para el contador ---
  const iso = buildISOFromRow(r, TZ_OFFSET);          // ISO robusto para contador
  const copy = buildHumanDateCopy(iso, r);            // "Lanza el 30 oct 2025", etc.

  if (meta) {
    meta.dataset.releaseIso = iso;                    // <-- clave para el contador
    meta.textContent = copy;
  }

  // --- 4) Retornar para app.js / contador (por si lo usas así) ---
  return { releaseDate: iso };
}

function writeEmptyUI(wrap, meta) {
  if (wrap) wrap.innerHTML = '<p class="muted">Aún no hay release cargado.</p>';
  if (meta) {
    meta.removeAttribute('data-release-iso');
    meta.textContent = 'Fecha de lanzamiento no definida';
  }
}

/**
 * Intenta construir un ISO con zona horaria consistente.
 * Prioridades:
 *  1) r.release_iso (si existe y ya trae hora/zonahoraria) -> usar tal cual
 *  2) r.release_datetime (si existe) -> si no trae zona, añade TZ_OFFSET
 *  3) r.release_date (YYYY-MM-DD) -> añade "T00:00:00" + TZ_OFFSET
 */
function buildISOFromRow(r, tzOffset = '-06:00') {
  const rawISO =
    r.release_iso ||
    r.release_datetime ||
    r.release_date ||
    '';

  if (!rawISO) return '';

  // Si ya trae zona horaria o Z, úsalo directo.
  // (ej: 2025-10-30T00:00:00-06:00  |  2025-10-30T06:00:00Z)
  if (/[zZ]|[+\-]\d{2}:\d{2}$/.test(rawISO)) {
    return rawISO;
  }

  // Si trae 'T' pero sin zona -> añade zona.
  if (rawISO.includes('T')) {
    return `${rawISO}${tzOffset}`;
  }

  // Si es solo fecha YYYY-MM-DD -> asume 00:00:00 + zona
  return `${rawISO}T00:00:00${tzOffset}`;
}

/**
 * Genera el copy legible en español MX a partir del ISO.
 * Ejemplo: "Lanza el 30 oct 2025"
 * Si en la fila hay un título u otro dato, puedes enriquecerlo aquí.
 */
function buildHumanDateCopy(iso, row) {
  if (!iso) return 'Fecha de lanzamiento no definida';

  // Renderiza en la zona local del navegador; el contador usa el ISO directamente.
  const d = new Date(iso);
  if (isNaN(d)) return 'Fecha de lanzamiento no definida';

  // Formato corto, estilo editorial.
  const fmt = new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const nice = fmt.format(d).replace(/\./g, ''); // quitar puntos en "oct."
  // Puedes personalizar el verbo: "Lanza", "Sale", etc.
  return `Lanza el ${nice}`;
}

async function trackClick(release_id, platform) {
  try {
    await sb.from('clicks').insert({ release_id, platform });
  } catch (e) {
    console.error('click insert error', e);
  }
}
