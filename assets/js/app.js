import { $ } from './dom.js';
import { loadRelease } from './release.js';
import { initNewsletter } from './newsletter.js';
import { checkSession, bindAdminUI } from './admin.js';
import { initBackgroundParallax } from './bg.js';

$('#year').textContent = new Date().getFullYear();

initBackgroundParallax();
initNewsletter();
bindAdminUI();

loadRelease();
checkSession();
