// Nav that frosts once you scroll, the phone menu, the Copy button and the live "Updated" lines.
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

  // One request to GitHub for when each project last changed. Hidden if it fails or is older than four months.
  const updated = document.querySelectorAll('[data-repo]');
  const show = (pushed) => updated.forEach((el) => {
    const days = Math.floor((Date.now() - Date.parse(pushed[el.dataset.repo])) / 864e5);
    if (!(days >= 0) || days > 120) return;
    el.textContent = days === 0 ? 'Updated today' : days === 1 ? 'Updated yesterday'
      : days < 14 ? `Updated ${days} days ago` : days < 60 ? `Updated ${Math.round(days / 7)} weeks ago`
      : `Updated ${Math.round(days / 30)} months ago`;
    el.hidden = false;
  });
  let cached = null;
  try { cached = JSON.parse(sessionStorage.getItem('pushed')); } catch {}
  if (cached) show(cached);
  else if (updated.length) {
    fetch('https://api.github.com/users/DavidHiFi/repos?per_page=100')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((list) => {
        const pushed = Object.fromEntries(list.map((r) => [r.name, r.pushed_at]));
        try { sessionStorage.setItem('pushed', JSON.stringify(pushed)); } catch {}
        show(pushed);
      })
      .catch(() => {});
  }
})();
