import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ⚠️ Tus valores públicos
const SUPABASE_URL = 'https://jlqyakreaqzhbtuxrywu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscXlha3JlYXF6aGJ0dXhyeXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyOTM2MzcsImV4cCI6MjA3NDg2OTYzN30.fcv7farkqI1M66q8vF0emDzU8lrezNvyWcXsYstM3_U';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (sel) => document.querySelector(sel);

document.querySelector('#year').textContent = new Date().getFullYear();

// -------- Auth + UI toggle --------
async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  toggleAdmin(!!session);
  if (session) { renderAdmin(); }
}
function toggleAdmin(isIn) {
  $('#admin-guest').classList.toggle('hide', isIn);
  $('#admin-authed').classList.toggle('hide', !isIn);
}

// login
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = /** @type {HTMLInputElement} */($('#login-email')).value.trim();
  const password = /** @type {HTMLInputElement} */($('#login-pass')).value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  $('#login-msg').textContent = error ? 'Login inválido' : 'Entraste';
  if (!error) { toggleAdmin(true); renderAdmin(); }
});

// logout
$('#btn-logout')?.addEventListener('click', async () => {
  await sb.auth.signOut();
  toggleAdmin(false);
});

$('#btn-refresh')?.addEventListener('click', renderAdmin);

// -------- Dashboard --------
async function renderAdmin() {
  const { data: user } = await sb.auth.getUser();
  $('#whoami').textContent = user?.user?.email || '';

  // Totales
  const { data: totals } = await sb.from('v_totals').select('*').limit(1);
  const t = totals?.[0] || { subscribers: 0, clicks_total: 0, releases_total: 0 };
  $('#kpis').innerHTML =
    `<div class="row">
      <div class="pill">Subs: <b>${t.subscribers}</b></div>
      <div class="pill">Clicks: <b>${t.clicks_total}</b></div>
      <div class="pill">Releases: <b>${t.releases_total}</b></div>
    </div>`;

  // Clicks por plataforma
  const { data: clicks } = await sb.from('v_clicks_by_release').select('*');
  $('#tbl-clicks').innerHTML = '<tr><th>Release</th><th>Plataforma</th><th>Clicks</th></tr>' +
    (clicks || []).map(r => `<tr><td>${r.title}</td><td>${r.platform || '-'}</td><td>${r.clicks}</td></tr>`).join('');

  // Suscriptores
  const { data: subs } = await sb.from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  $('#tbl-subs').innerHTML = '<tr><th>Email</th><th>Consent</th><th>Fecha</th></tr>' +
    (subs || []).map(s => `<tr><td>${s.email}</td><td>${s.consent ? '✔️' : '—'}</td><td>${new Date(s.created_at).toLocaleString()}</td></tr>`).join('');

  // Releases
  const { data: rels } = await sb.from('releases').select('*').order('created_at', { ascending: false });
  $('#tbl-releases').innerHTML = '<tr><th>Título</th><th>Slug</th><th>Fecha</th><th>Presave</th></tr>' +
    (rels || []).map(r => `<tr>
      <td>${r.title}</td>
      <td>${r.slug}</td>
      <td>${r.release_date || '-'}</td>
      <td><pre style="white-space:pre-wrap">${JSON.stringify(r.presave_urls || {}, null, 2)}</pre></td>
    </tr>`).join('');
}

// Crear nuevo release
$('#btn-new-release')?.addEventListener('click', async () => {
  const title = prompt('Título del release'); if (!title) return;
  const slug = prompt('Slug único (ej: blew-my-mind)'); if (!slug) return;
  const date = prompt('Fecha (YYYY-MM-DD) o vacío');
  const universal = prompt('URL presave universal (DistroKid)') || '';
  const presave_urls = { universal };
  const payload = { title, slug, presave_urls };
  if (date) payload.release_date = new Date(date).toISOString();

  const { error } = await sb.from('releases').insert(payload);
  if (error) alert('Error creando release: ' + error.message);
  else renderAdmin();
});

// init
checkSession();
