const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  nav.classList.remove('is-open');
  header.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  nav.classList.toggle('is-open', open);
  header.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 30); }
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
const galleryImage = document.querySelector('.main-product-image img');
if (galleryImage) {
  document.querySelectorAll('[data-gallery-image]').forEach(button => {
    button.addEventListener('click', () => {
      galleryImage.src = `assets/img/${button.dataset.galleryImage}-grande.webp`;
      galleryImage.alt = `Render ${button.dataset.caption}`;
      document.querySelector('.gallery-caption').textContent = button.dataset.caption;
      document.querySelectorAll('.gallery-thumbs button').forEach(thumb => {
        thumb.setAttribute('aria-pressed', String(thumb.dataset.galleryImage === button.dataset.galleryImage));
      });
    });
  });
  const choices = document.querySelector('.product-choices');
  const frameSelector = document.querySelector('#frame-selector');
  function updateProductInquiry() {
    const sliding = document.querySelector('#opening').value.startsWith('Corrediza');
    const selectedFrame = frameSelector.querySelector('input[name="marco"]:checked');
    if (sliding) frameSelector.querySelector('input[value=""]').checked = true;
    frameSelector.querySelectorAll('input[name="marco"]:not([value=""])').forEach(input => { input.disabled = sliding; });
    frameSelector.querySelector('.frame-candidates').hidden = sliding;
    frameSelector.querySelector('.frame-sliding-note').hidden = !sliding;
    const frame = sliding ? 'A definir para apertura corrediza' : selectedFrame.value || 'A definir con asesoramiento';
    document.querySelector('[data-current-frame]').textContent = frame;
    const query = new URLSearchParams({ producto: choices.dataset.product });
    choices.querySelectorAll('select').forEach(select => { if (select.value) query.set(select.name, select.value); });
    query.set('marco', frame);
    document.querySelectorAll('[data-product-inquiry]').forEach(link => {
      const linkQuery = new URLSearchParams(query);
      if (link.dataset.inquiryType) linkQuery.set('tipo', link.dataset.inquiryType);
      link.href = `contacto.html?${linkQuery}`;
    });
    document.querySelector('#configuration-summary').textContent = [...query.values()].join(' · ');
  }
  choices.addEventListener('change', updateProductInquiry);
  frameSelector.addEventListener('change', updateProductInquiry);
  updateProductInquiry();
}
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const params = new URLSearchParams(window.location.search);
  const type = document.querySelector('#type');
  const projectFields = document.querySelector('#professional-fields');
  if (['particular', 'obra', 'tecnica', 'showroom'].includes(params.get('tipo'))) type.value = params.get('tipo');
  function updateProjectFields() {
    projectFields.hidden = type.value !== 'obra';
    projectFields.disabled = type.value !== 'obra';
  }
  type.addEventListener('change', updateProjectFields);
  updateProjectFields();
  const selection = ['producto', 'terminacion', 'configuracion', 'version', 'marco'].filter(key => params.get(key)).map(key => {
    const labels = { producto: 'Puerta', terminacion: 'Terminación', configuracion: 'Configuración', version: 'Versión', marco: 'Marco de interés (a confirmar)' };
    return `${labels[key]}: ${params.get(key)}`;
  });
  if (selection.length) {
    document.querySelector('#inquiry-context').hidden = false;
    document.querySelector('#context-text').textContent = selection.join('\n');
    document.querySelector('#message').value = 'Me gustaría recibir asesoramiento y más información sobre esta puerta.';
  }
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const message = [
      'Hola, Marroncelli. Quiero hacer una consulta.',
      `Nombre: ${data.get('nombre').trim()}`,
      `Contacto: ${data.get('contacto').trim()}`,
      `Consulta: ${type.options[type.selectedIndex].text}`,
      ...selection,
      ...[['empresa', 'Empresa o estudio'], ['ubicacion', 'Ubicación de obra'], ['cantidad', 'Cantidad estimada']]
        .filter(([key]) => data.get(key)?.trim())
        .map(([key, label]) => `${label}: ${data.get(key).trim()}`),
      '', data.get('mensaje').trim()
    ].join('\n');
    window.location.href = `https://wa.me/5491126696918?text=${encodeURIComponent(message)}`;
  });
}
