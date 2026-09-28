(() => {
  const blocks = document.querySelectorAll([
    '.product-heading',
    '.product-feature > .product-room',
    '.product-feature > .product-info',
    '.frames-heading',
    '.frames-visual',
    '.frames-collection-heading',
    '.frame-system',
    '.works-heading',
    '.work-preview',
    '.catalog-intro',
    '.catalog-render-card',
    '.catalog-frames > .catalog-wrap',
    '.catalog-heading',
    '.enrasado-note',
    '.portfolio-intro',
    '.portfolio-project',
    '.leaf-intro-heading',
    '.leaf-section-heading',
    '.project-heading',
    '.project-main-figure',
    '.project-story'
  ].join(', '));
  if (!blocks.length) return;

  document.querySelectorAll('.product-feature, .catalog-render-card').forEach((model, index) => {
    const parts = model.matches('.product-feature') ? model.querySelectorAll(':scope > .product-room, :scope > .product-info') : [model];
    parts.forEach(part => { part.dataset.entrySide = index % 2 ? 'right' : 'left'; });
  });

  const pending = new Set();
  let observer;

  function reveal(block, immediate = false) {
    if (immediate) block.classList.remove('scroll-entry');
    block.classList.remove('is-pending');
    pending.delete(block);
    observer.unobserve(block);
  }

  function revealAtPageEnd() {
    if (!pending.size || window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 2) return;
    pending.forEach(block => {
      const bounds = block.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) reveal(block);
    });
  }

  function observePending() {
    observer?.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      });
    }, { threshold: 0, rootMargin: `0px 0px -${Math.round(window.innerHeight / 3)}px 0px` });
    pending.forEach(block => observer.observe(block));
    revealAtPageEnd();
  }

  blocks.forEach(block => {
    if (block.getBoundingClientRect().top <= window.innerHeight * 2 / 3 || block.contains(document.activeElement)) return;
    block.classList.add('scroll-entry', 'is-pending');
    pending.add(block);
  });
  observePending();

  function revealAnchor() {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    pending.forEach(block => {
      if (block === target || block.contains(target) || (target.matches('.product-feature') && target.contains(block))) reveal(block, true);
    });
  }
  revealAnchor();

  document.addEventListener('focusin', event => {
    const block = event.target.closest('.scroll-entry');
    if (!block) return;
    reveal(block, true);
  });
  window.addEventListener('resize', observePending);
  window.addEventListener('scroll', revealAtPageEnd, { passive: true });
  window.addEventListener('hashchange', revealAnchor);
})();
