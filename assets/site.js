// Nav that frosts once you scroll, the phone menu, and the Copy button. Nothing else.
(() => {
  const nav = document.querySelector('[data-nav]');
  const toggle = nav.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');

  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setOpen = (open) => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = document.getElementById(btn.dataset.copy).textContent.trim();
      let done = true;
      try { await navigator.clipboard.writeText(text); } catch {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById(btn.dataset.copy));
        getSelection().removeAllRanges(); getSelection().addRange(range);
        try { done = document.execCommand('copy'); } catch { done = false; }
      }
      btn.textContent = done ? 'Copied' : 'Press Ctrl+C';
      btn.classList.toggle('is-done', done);
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1800);
    });
  });
})();
