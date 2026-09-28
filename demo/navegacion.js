(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-menu');
  const mobile = window.matchMedia('(max-width: 900px)');
  document.documentElement.classList.add('navigation-ready');

  toggle.addEventListener('click', () => {
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
  });
  menu.querySelector('.site-menu-close').addEventListener('click', () => menu.close());
  menu.addEventListener('close', () => toggle.setAttribute('aria-expanded', 'false'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));
  menu.addEventListener('click', event => {
    if (event.target !== menu) return;
    const bounds = menu.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) menu.close();
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches && menu.open) menu.close();
  });

  const header = document.querySelector('.site-header');
  const sectionNav = document.querySelector('.leaf-nav, .catalog-index');
  const sizes = new ResizeObserver(entries => {
    for (const entry of entries) {
      document.body.style.setProperty(entry.target === header ? '--header-height' : '--section-nav-height', `${entry.borderBoxSize[0].blockSize}px`);
    }
  });
  sizes.observe(header);
  if (sectionNav) sizes.observe(sectionNav);
})();
