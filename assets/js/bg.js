export function initBackgroundParallax() {
  let rect = document.body.getBoundingClientRect();
  addEventListener('resize', () => { rect = document.body.getBoundingClientRect(); });

  let ticking = false;
  addEventListener('pointermove', (e) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      document.body.style.setProperty('--posX', x);
      document.body.style.setProperty('--posY', y);
      ticking = false;
    });
  }, { passive: true });
}
