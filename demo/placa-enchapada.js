(() => {
  const finishes = {
    nogal: {
      name: 'Nogal rayado', render: 'placa-en-nogal-rayado-a2-grande.webp',
      texture: 'enchapada-nogal-rayado-grande.webp', room: 'oscuro', position: '43% 50%',
      roomAlt: 'Puerta de madera oscura casi de frente, integrada en un ambiente de paredes blancas junto a una mesada',
      source: 'Houtmerk', url: 'https://houtmerk.nl/products/houtmerk-noten-deur-met-onzichtbaar-kozijn-maatwerk-hout'
    },
    roble: {
      name: 'Roble floreado', render: 'placa-en-roble-floreado-a1-grande.webp',
      texture: 'enchapado-de-madera-roble-floreado-grande.webp', room: 'claro', position: '59% 50%',
      roomAlt: 'Puerta de madera clara de frente en un ambiente con sillón, alfombra y escritorio',
      source: 'VOX', url: 'https://vox.pl/en/inspirations/ideas/fornir-czy-laminat-jaka-okleine-na-drzwi-wybrac'
    }
  };
  const frames = {
    'marco-y-contramarco': {
      name: 'Marco y contramarco',
      text: 'Un perímetro visible sobre la pared. Los contramarcos pueden ser lisos o moldurados y tienen ajuste telescópico según el espesor del tabique.'
    },
    'marco-buna-filo-interior': {
      name: 'Marco buña filo interior',
      text: 'Una buña delimita el marco y dibuja una línea de sombra. La hoja queda retirada respecto de la cara exterior del marco.'
    },
    'marco-buna-filo-exterior': {
      name: 'Marco buña filo exterior',
      text: 'La buña recorre el encuentro con la pared. La hoja queda alineada con la cara exterior del marco.'
    },
    'filo-muro': {
      name: 'Filo muro',
      text: 'La hoja queda en el plano de la pared, sin contramarcos a la vista en la cara representada. Este sistema corresponde a hoja Placa.'
    },
    enrasado: {
      name: 'Marco enrasado',
      text: 'Una alternativa exclusiva para hoja Placa. Sus detalles de instalación y medidas se consultan con el equipo comercial; es un sistema distinto de Filo muro.'
    }
  };
  const openings = {
    simple: 'Simple', doble: 'Doble', pano: 'Simple con paño superior fijo', media: 'Puerta y media',
    'corrediza-simple': 'Corrediza simple', 'corrediza-doble': 'Corrediza doble'
  };
  const params = new URLSearchParams(location.search);
  let finish = Object.hasOwn(finishes, params.get('acabado')) ? params.get('acabado') : 'nogal';
  let frame = 'marco-y-contramarco';
  let opening = 'simple';
  const finishInputs = [...document.querySelectorAll('[name="acabado"]')];
  const frameInputs = [...document.querySelectorAll('[name="marco"]')];
  const openingInputs = [...document.querySelectorAll('[name="apertura"]')];
  const dialog = document.querySelector('#query-dialog');
  const message = document.querySelector('#query-message');
  const whatsapp = document.querySelector('#query-whatsapp');
  let displayedFinish = document.querySelector('#leaf-render-caption').textContent;

  function updateSummary() {
    document.querySelector('#query-finish').textContent = finishes[finish].name;
    document.querySelector('#query-frame').textContent = opening.startsWith('corrediza')
      ? 'A definir para apertura corrediza' : frames[frame].name;
    document.querySelector('#query-opening').textContent = openings[opening];
  }

  async function renderFinish(animate = false) {
    const selected = finishes[finish];
    finishInputs.forEach(input => { input.checked = input.value === finish; });
    const render = document.querySelector('#leaf-render-image');
    const texture = document.querySelector('#wood-detail-image');
    const room = document.querySelector('#leaf-room-image');
    const caption = document.querySelector('#leaf-render-caption');
    const status = document.querySelector('#finish-status');
    const roomSrc = `assets/img/referencia-ambiente-${selected.room}-1400.webp`;
    const roomSrcset = `assets/img/referencia-ambiente-${selected.room}-800.webp 800w, assets/img/referencia-ambiente-${selected.room}-1400.webp 1400w`;
    updateSummary();
    if (animate) {
      caption.textContent = `Cargando vista de ${selected.name}…`;
      status.textContent = `Cargando ${selected.name}.`;
    }
    const result = await window.FinishMotion(document.querySelector('.leaf-finishes'), [
      { image: render, src: `assets/img/${selected.render}` },
      { image: texture, src: `assets/img/${selected.texture}` },
      { image: room, src: roomSrc, srcset: roomSrcset }
    ], () => {
      render.src = `assets/img/${selected.render}`;
      render.alt = `Render oficial de Placa enchapada en ${selected.name.toLowerCase()}, vista frontal con marco`;
      texture.src = `assets/img/${selected.texture}`;
      texture.alt = `Detalle de la veta del enchapado ${selected.name.toLowerCase()}`;
      room.srcset = roomSrcset;
      room.src = roomSrc;
      room.alt = selected.roomAlt;
      room.style.objectPosition = selected.position;
      const source = document.querySelector('#leaf-room-source');
      source.href = selected.url;
      source.textContent = `${selected.source} ↗`;
      displayedFinish = selected.name;
      caption.textContent = selected.name;
    }, animate);
    if (result === 'failed') {
      caption.textContent = `${displayedFinish} · Vista anterior; no se pudo cargar ${selected.name}.`;
      status.textContent = `Seleccionaste ${selected.name}, pero sus imágenes no pudieron cargarse. Se conserva la vista de ${displayedFinish}.`;
    } else if (animate && result === 'updated') {
      status.textContent = `${selected.name}: render, textura y ambiente de referencia actualizados.`;
    }
  }

  function renderFrame() {
    const sliding = opening.startsWith('corrediza');
    const illustrated = !sliding && frame !== 'enrasado';
    frameInputs.forEach(input => {
      input.disabled = sliding;
      input.checked = !sliding && input.value === frame;
    });
    document.querySelector('#frame-drawing').hidden = !illustrated;
    document.querySelector('#frame-unpictured').hidden = illustrated;
    const pdf = document.querySelector('#frame-pdf');
    pdf.hidden = !illustrated;
    if (illustrated) {
      const image = document.querySelector('#frame-image');
      image.src = `assets/img/${frame}-seccion-1100.webp`;
      image.alt = `Render de sección del sistema ${frames[frame].name}, tomado de su ficha técnica`;
      document.querySelector('#frame-image-caption').textContent = frames[frame].name;
      pdf.href = `assets/pdf/${frame}.pdf`;
    }
    document.querySelector('#frame-name').textContent = sliding ? 'El marco para una corrediza' : frames[frame].name;
    document.querySelector('#frame-text').textContent = sliding
      ? 'El sistema de marco para esta apertura se define con el equipo comercial. Tu consulta incluirá la apertura corrediza que elegiste.'
      : frames[frame].text;
    document.querySelector('#unpictured-title').textContent = sliding ? 'Una solución para tu corrediza.' : 'Marco enrasado';
    document.querySelector('#unpictured-text').textContent = sliding
      ? 'El sistema depende de la apertura y de las características de tu obra. Lo definimos con vos.'
      : 'Consultá su estructura, medidas y condiciones de instalación. La imagen técnica de este sistema todavía no está disponible en esta presentación.';
    document.querySelector('#frame-note').textContent = sliding
      ? 'Podés volver a explorar los sistemas al elegir una apertura batiente.'
      : 'La combinación de hoja, apertura y marco se confirma según las características de tu obra.';
    document.querySelector('#opening-note').textContent = sliding
      ? 'Elegiste una corrediza: el marco pasa a definir con asesoramiento. Tu selección anterior se recupera si volvés a una apertura batiente.'
      : 'La apertura se confirma junto con las medidas y el sistema de marco.';
    updateSummary();
  }

  finishInputs.forEach(input => input.addEventListener('change', () => {
    finish = input.value;
    renderFinish(true);
    const url = new URL(location.href);
    url.searchParams.set('acabado', finish);
    history.replaceState(null, '', url);
  }));
  frameInputs.forEach(input => input.addEventListener('change', () => {
    frame = input.value;
    renderFrame();
  }));
  openingInputs.forEach(input => input.addEventListener('change', () => {
    opening = input.value;
    renderFrame();
  }));

  document.querySelector('#review-query').addEventListener('click', () => {
    const frameName = opening.startsWith('corrediza') ? 'A definir para apertura corrediza' : frames[frame].name;
    message.value = `Hola, Marroncelli. Me interesa una puerta para mi proyecto.\n\nHoja: Placa enchapada\nAcabado de interés: ${finishes[finish].name}\nSistema de marco: ${frameName}\nApertura: ${openings[opening]}\n\nQuisiera asesoramiento para confirmar el enchapado, las medidas y esta combinación.`;
    whatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(message.value)}`;
    dialog.showModal();
  });
  message.addEventListener('input', () => {
    whatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(message.value)}`;
  });
  renderFinish();
  renderFrame();
})();
