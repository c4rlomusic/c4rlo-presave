// assets/js/app.js  (HOME - SOLO PÚBLICO)
import { $ } from './dom.js';
import { loadRelease } from './release.js';
import { initNewsletter } from './newsletter.js';
import { initBackgroundParallax } from './bg.js';

$('#year').textContent = new Date().getFullYear();

initBackgroundParallax();
initNewsletter();
loadRelease();
