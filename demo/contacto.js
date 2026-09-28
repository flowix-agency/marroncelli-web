(() => {
  const form = document.querySelector('#form-consulta');
  const fields = document.querySelector('.campos');
  const radios = [...form.querySelectorAll('[name="tipo"]')];
  const projectFields = document.querySelector('#proyecto-extra');
  const context = document.querySelector('#contexto');
  const review = document.querySelector('#revision');
  const reviewedMessage = document.querySelector('#revision-mensaje');
  const whatsapp = document.querySelector('#whatsapp');
  const nameInput = document.querySelector('#f-nombre');
  const contactInput = document.querySelector('#f-contacto');
  const types = {
    vivienda: 'Vivienda unifamiliar',
    constructora: 'Constructora o desarrollo',
    producto: 'Consulta de producto o técnica',
    showroom: 'Visita al showroom',
    distribuidores: 'Distribuidores'
  };
  const products = ['Placa enchapada', 'Placa pintada', 'Placa foliada', 'Aldeana', 'Burdeos', 'Toscana', 'Sardegna', 'Avignon'];
  const params = new URLSearchParams(location.search);
  let product = products.includes(params.get('producto')) ? params.get('producto') : '';
  const requestedType = params.get('tipo');
  const initialRadio = radios.find(radio => radio.value === requestedType) || (product ? radios.find(radio => radio.value === 'producto') : null);
  if (initialRadio) initialRadio.checked = true;

  function updateType() {
    const selected = radios.find(radio => radio.checked);
    projectFields.hidden = !selected || !['vivienda', 'constructora'].includes(selected.value);
  }

  if (product) {
    context.hidden = false;
    document.querySelector('#contexto-producto').textContent = product;
  }
  document.querySelector('#quitar-contexto').addEventListener('click', () => {
    product = '';
    context.hidden = true;
    review.hidden = true;
    const url = new URL(location.href);
    url.searchParams.delete('producto');
    history.replaceState(null, '', url);
    nameInput.focus();
  });

  fields.addEventListener('input', () => { review.hidden = true; });
  fields.addEventListener('change', event => {
    if (event.target.name === 'tipo') updateType();
    review.hidden = true;
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const selectedType = radios.find(radio => radio.checked);
    const contact = contactInput.value.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const phoneValid = /^[+\d\s().-]+$/.test(contact) && (contact.match(/\d/g) || []).length >= 8;
    const errors = [
      { input: nameInput, target: 'e-nombre', text: nameInput.value.trim() ? '' : 'Escribí tu nombre.' },
      { input: contactInput, target: 'e-contacto', text: !contact ? 'Dejanos un correo o un teléfono.' : (emailValid || phoneValid ? '' : 'Revisá el correo o el teléfono.') },
      { input: radios[0], target: 'e-tipo', text: selectedType ? '' : 'Elegí un tipo de consulta.' }
    ];
    errors.forEach(error => {
      document.querySelector(`#${error.target}`).textContent = error.text;
      error.input.setAttribute('aria-invalid', String(Boolean(error.text)));
    });
    const firstError = errors.find(error => error.text);
    const status = document.querySelector('#form-status');
    if (firstError) {
      review.hidden = true;
      status.textContent = 'Revisá los campos indicados antes de continuar.';
      firstError.input.focus();
      return;
    }

    const lines = ['Hola, Marroncelli. Les escribo desde la web.', '', `Nombre: ${nameInput.value.trim()}`, `Contacto: ${contact}`, `Tipo de consulta: ${types[selectedType.value]}`];
    if (!projectFields.hidden) {
      const projectData = [['f-empresa', 'Empresa o estudio'], ['f-ubicacion', 'Ubicación de la obra'], ['f-cantidad', 'Cantidad estimada de puertas']];
      projectData.forEach(([id, label]) => {
        const value = document.querySelector(`#${id}`).value.trim();
        if (value) lines.push(`${label}: ${value}`);
      });
    }
    if (product) lines.push(`Línea de interés: ${product}`);
    const message = document.querySelector('#f-mensaje').value.trim();
    if (message) lines.push('', 'Mensaje:', message);
    reviewedMessage.value = lines.join('\n');
    whatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(reviewedMessage.value)}`;
    review.hidden = false;
    status.textContent = 'Mensaje preparado. Podés revisarlo y editarlo antes de continuar en WhatsApp.';
    document.querySelector('#revision-titulo').focus();
  });

  reviewedMessage.addEventListener('input', () => {
    whatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(reviewedMessage.value)}`;
  });
  document.querySelector('#editar').addEventListener('click', () => {
    review.hidden = true;
    nameInput.focus();
  });
  updateType();
})();
