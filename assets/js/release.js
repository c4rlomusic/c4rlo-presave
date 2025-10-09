import { sb } from './api.js';
import { $ } from './dom.js';

export async function loadRelease() {
  const { data, error } = await sb.from('releases')
    .select('*')
    .order('release_date', { ascending: true })
    .limit(1);

  if (error) { console.error(error); return; }
  const r = data?.[0];
  const wrap = $('#presave-buttons');

  if (!r) {
    wrap.innerHTML = '<p class="muted">Aún no hay release cargado.</p>';
    return;
  }

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

  if (r.release_date) {
    const [year, month, dayRaw] = r.release_date.split('-');
    const day = dayRaw.slice(0,2); // por si viene con "T00:00:00"
    const formatted = `${day}-${month}-${year.slice(2)}`;
    document.querySelector('#release-meta').textContent = `Sale el ${formatted}`;
  } else {
    document.querySelector('#release-meta').textContent = 'Fecha de lanzamiento no definida';
  }
}

async function trackClick(release_id, platform) {
  try { await sb.from('clicks').insert({ release_id, platform }); }
  catch (e) { console.error('click insert error', e); }
}
