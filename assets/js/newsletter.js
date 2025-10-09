import { sb } from './api.js';
import { $ } from './dom.js';

export function initNewsletter() {
  $('#form-sub').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = /** @type {HTMLInputElement} */($('#sub-email')).value.trim();
    const consent = /** @type {HTMLInputElement} */($('#sub-consent')).checked;
    if (!email) return;

    const { error } = await sb.from('subscribers').insert({ email, consent });
    $('#sub-msg').textContent = error
      ? 'Hubo un problema. Intenta de nuevo.'
      : '¡Listo! Te agregué a la lista. Revisa tu correo si llega confirmación.';
    if (!error) e.target.reset();
  });
}
