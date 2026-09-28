(() => {
  const frames = {
    'marco-y-contramarco': {
      name: 'Marco y contramarco',
      text: 'Los contramarcos cubren el encuentro con la pared. Pueden ser lisos o moldurados y se regulan según el espesor del tabique.',
      alt: 'Ilustración técnica en corte del sistema Marco y contramarco, con el contramarco sobre la pared'
    },
    'marco-buna-filo-interior': {
      name: 'Marco buña filo interior',
      text: 'Una buña delimita el marco y dibuja una línea de sombra. La hoja queda retirada respecto de la cara exterior del marco.',
      alt: 'Ilustración técnica en corte del Marco buña filo interior, con una buña entre pared y marco'
    },
    'marco-buna-filo-exterior': {
      name: 'Marco buña filo exterior',
      text: 'La buña recorre el encuentro con la pared y la hoja queda alineada con la cara exterior del marco.',
      alt: 'Ilustración técnica en corte del Marco buña filo exterior, con la hoja cerrada'
    },
    'filo-muro': {
      name: 'Filo muro',
      text: 'La hoja queda en el plano de la pared, sin contramarcos a la vista en esa cara.',
      alt: 'Ilustración técnica en corte del sistema Filo muro, con la hoja alineada con la pared'
    }
  };
  const leaves = {
    placa: 'Placa enchapada',
    'placa-pintada': 'Placa pintada',
    'placa-foliada': 'Placa foliada',
    aldeana: 'Aldeana',
    burdeos: 'Burdeos',
    toscana: 'Toscana',
    sardegna: 'Sardegna',
    avignon: 'Avignon'
  };
  const leafSelect = document.querySelector('#frame-door');
  const requestedLeaf = new URLSearchParams(location.search).get('hoja');
  if (Object.hasOwn(leaves, requestedLeaf)) leafSelect.value = requestedLeaf;
  const buttons = [...document.querySelectorAll('[data-frame]')];
  let selectedFrame = Object.hasOwn(frames, location.hash.slice(1)) ? location.hash.slice(1) : 'marco-y-contramarco';

  function render() {
    const isPlaca = ['placa', 'placa-pintada', 'placa-foliada'].includes(leafSelect.value);
    if (!isPlaca && selectedFrame === 'filo-muro') selectedFrame = 'marco-y-contramarco';
    const url = new URL(location.href);
    url.searchParams.set('hoja', leafSelect.value);
    url.hash = selectedFrame;
    history.replaceState(null, '', url);
    const frame = frames[selectedFrame];
    buttons.forEach(button => {
      button.hidden = !isPlaca && button.dataset.frame === 'filo-muro';
      button.setAttribute('aria-pressed', String(button.dataset.frame === selectedFrame));
    });
    document.querySelector('.enrasado-note').hidden = !isPlaca;
    document.querySelector('.product-frame-options').setAttribute('aria-label', `Explorar sistemas de marco para ${leaves[leafSelect.value]}`);
    const image = document.querySelector('#product-frame-image');
    image.src = `assets/img/${selectedFrame}-seccion-1100.webp`;
    image.width = selectedFrame === 'marco-y-contramarco' ? 820 : 1100;
    image.height = selectedFrame === 'marco-y-contramarco' ? 721 : 952;
    image.alt = frame.alt;
    document.querySelector('#product-frame-title').textContent = frame.name;
    document.querySelector('#product-frame-text').textContent = frame.text;
    document.querySelector('#product-frame-compatibility').textContent = selectedFrame === 'filo-muro'
      ? 'Solo para hoja Placa. La apertura y las condiciones de instalación se confirman según tu proyecto.'
      : 'La combinación de hoja, apertura y marco se confirma según tu proyecto.';
    document.querySelector('#product-frame-pdf').href = `assets/pdf/${selectedFrame}.pdf`;
    const message = `Hola, Marroncelli. Me interesa la puerta ${leaves[leafSelect.value]} con el sistema ${frame.name}. Quisiera confirmar la combinación de hoja, apertura y marco para mi proyecto.`;
    document.querySelector('#frame-contact').href = `https://wa.me/5491126696918?text=${encodeURIComponent(message)}`;
    const enrasadoMessage = `Hola, Marroncelli. Quisiera conocer las características del marco enrasado para la hoja ${leaves[leafSelect.value]} y confirmar la combinación de hoja, apertura y marco para mi proyecto.`;
    document.querySelector('.enrasado-note a').href = `https://wa.me/5491126696918?text=${encodeURIComponent(enrasadoMessage)}`;
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    selectedFrame = button.dataset.frame;
    render();
  }));
  leafSelect.addEventListener('change', render);
  window.addEventListener('hashchange', () => {
    const key = location.hash.slice(1);
    if (!Object.hasOwn(frames, key)) return;
    selectedFrame = key;
    render();
  });
  render();
})();
