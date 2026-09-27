// Loads this design system into the template. In a consuming project, point
// base at the bound DS folder relative to this file (e.g. '_ds/<folder>' at
// the project root, '../_ds/<folder>' one level down) — one line to edit.
(() => {
  if (window.__ppDsLoaded) return; window.__ppDsLoaded = true;
  const base = '_ds/pink-paprikaa-design-system-23ef632d-7eaf-4c27-b145-10ade341b448';
  for (const p of ["tokens/fonts.css","tokens/colors.css","tokens/typography.css","tokens/spacing.css","tokens/breakpoints.css","tokens/canvas.css","tokens/elevation.css","tokens/motion.css","tokens/base.css","styles.css"]) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const b = document.createElement('script'); b.src = base + '/brand.js'; document.head.appendChild(b);
  const r = document.createElement('script'); r.src = 'rates.js'; document.head.appendChild(r);
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src + ' — if this is a consuming project, point the base line in ds-base.js at the bound _ds/<folder> tree relative to this page (e.g. _ds/<folder> at the project root, ../_ds/<folder> one level down); in a fresh design system this can just mean the bundle is not compiled yet');
  document.head.appendChild(s);
  // Motion: sections fade + rise 12px into view (brand motion rules). Reduced motion keeps the fade only.
  const st = document.createElement('style');
  st.textContent = ':root{--text-subtle:var(--ink-600)}[data-surface="brand"],[data-surface="ink"]{--text-body:#fff;--text-muted:rgba(255,255,255,.92);--text-subtle:rgba(255,255,255,.85)}' + '[data-surface="brand"] [style*="background: rgb(255, 255, 255)"],[data-surface="ink"] [style*="background: rgb(255, 255, 255)"],[data-surface="brand"] [style*="background-color: rgb(255, 255, 255)"],[data-surface="ink"] [style*="background-color: rgb(255, 255, 255)"]{--text-heading:var(--ink-900);--text-body:var(--ink-800);--text-muted:var(--ink-600);--text-subtle:var(--ink-500);--border-subtle:var(--ink-200);--border-default:var(--ink-300);--text-link:var(--pink-600);--text-link-hover:var(--pink-700);--text-brand:var(--pink-500)}[data-pp-reveal]{opacity:0;transform:translateY(12px);transition:opacity 340ms cubic-bezier(.2,.8,.2,1),transform 340ms cubic-bezier(.2,.8,.2,1)}[data-pp-reveal].pp-in{opacity:1;transform:none}@media (prefers-reduced-motion:reduce){[data-pp-reveal]{transform:none}}@media print{[data-pp-reveal]{opacity:1;transform:none}}';
  document.head.appendChild(st);
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('pp-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  const tag = () => document.querySelectorAll('section:not([data-pp-seen])').forEach(s => {
    s.setAttribute('data-pp-seen', '');
    if (!io || s.getBoundingClientRect().top < window.innerHeight) return;
    s.setAttribute('data-pp-reveal', ''); io.observe(s);
  });
  const start = () => { tag(); new MutationObserver(tag).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
