const modelRooms = {
  "lisa-nogal": {
    "image": "referencia-ambiente-oscuro-1400.webp",
    "srcset": "referencia-ambiente-oscuro-800.webp 800w, referencia-ambiente-oscuro-1400.webp 1400w",
    "width": 1400,
    "height": 1400,
    "position": "43% 50%",
    "fit": "cover",
    "alt": "Referencia externa: puerta lisa de madera oscura casi frontal, en un interior de paredes blancas.",
    "caption": "Ambiente de inspiración · referencia externa",
    "source": "Houtmerk",
    "href": "https://houtmerk.nl/products/houtmerk-noten-deur-met-onzichtbaar-kozijn-maatwerk-hout"
  },
  "lisa-roble": {
    "image": "referencia-ambiente-claro-1400.webp",
    "srcset": "referencia-ambiente-claro-800.webp 800w, referencia-ambiente-claro-1400.webp 1400w",
    "width": 1400,
    "height": 1078,
    "position": "59% 50%",
    "fit": "cover",
    "alt": "Referencia externa: puerta lisa de madera clara frente a un ambiente con sillón y escritorio.",
    "caption": "Ambiente de inspiración · referencia externa",
    "source": "VOX",
    "href": "https://vox.pl/en/inspirations/ideas/fornir-czy-laminat-jaka-okleine-na-drzwi-wybrac"
  },
  "lisa-blanco": {
    "image": "obra-nordelta-8654-1080.webp",
    "srcset": "obra-nordelta-8654-720.webp 720w, obra-nordelta-8654-1080.webp 1080w",
    "width": 1080,
    "height": 720,
    "position": "54% 50%",
    "fit": "cover",
    "alt": "Ambiente de Nordelta Castaños con dos puertas blancas junto a ventanales y piso de madera; modelos sin identificar.",
    "caption": "Ambiente de obra · modelo y acabado sin identificar",
    "source": "Nordelta Castaños",
    "href": "obra-nordelta-castanos.html"
  },
  "san-diego": {
    "image": "hero-san-diego-1600.webp",
    "srcset": "hero-san-diego-1600.webp 1600w",
    "width": 1600,
    "height": 1067,
    "position": "29% 50%",
    "fit": "cover",
    "alt": "Ambiente de San Diego con puerta doble blanca, pared de listones de madera y banco; modelo sin identificar.",
    "caption": "Ambiente de obra · modelo y acabado sin identificar",
    "source": "San Diego · Archivo Marroncelli",
    "href": "index.html#inicio"
  },
  "tableros-nogal": {
    "image": "referencia-tableros-nogal-1400.webp",
    "srcset": "referencia-tableros-nogal-800.webp 635w, referencia-tableros-nogal-1400.webp 810w",
    "width": 810,
    "height": 1020,
    "position": "50% 50%",
    "fit": "contain",
    "alt": "Referencia externa: Puerta de dos tableros en madera oscura, casi frontal, junto a una silla y una cocina.",
    "caption": "Ambiente de inspiración · referencia externa",
    "source": "Hamiltons Doors and Floors",
    "href": "https://www.doorsandfloors.co.uk/deanta-walnut-kensington-standard-doors-and-fd30-fire-doors.html"
  },
  "tableros-roble": {
    "image": "referencia-tableros-roble-1400.webp",
    "srcset": "referencia-tableros-roble-800.webp 800w, referencia-tableros-roble-1400.webp 1400w",
    "width": 1400,
    "height": 1400,
    "position": "20% 50%",
    "fit": "cover",
    "alt": "Referencia externa: Puerta de dos tableros en roble claro, de frente en un dormitorio.",
    "caption": "Ambiente de inspiración · referencia externa",
    "source": "Buildworld",
    "href": "https://www.buildworld.co.uk/merchant/jb-kind-internal-oak-unfinished-trent-2p-door-various-height-and-width-available-bw-39054"
  },
  "tableros-blanco": {
    "image": "referencia-tableros-blanco-1400.webp",
    "srcset": "referencia-tableros-blanco-800.webp 800w, referencia-tableros-blanco-1400.webp 1000w",
    "width": 1000,
    "height": 1000,
    "position": "50% 50%",
    "fit": "cover",
    "alt": "Referencia externa: Puerta blanca de dos tableros, de frente, con una silla y canastos a los lados.",
    "caption": "Ambiente de inspiración · referencia externa",
    "source": "Lowe's / Masonite",
    "href": "https://www.lowes.com/pd/Masonite-Traditional-Primed-2-Panel-Square-Solid-Core-Molded-Composite-Pre-Hung-Door-Common-36-in-x-80-in-Actual-37-5-in-x-81-5-in/1000839544"
  }
};

(() => {
  const model = document.body.dataset.model;
  const finishes = [...document.querySelectorAll('[name="acabado"]')];
  const frameInputs = [...document.querySelectorAll('[name="marco"]')];
  const openingInputs = [...document.querySelectorAll('[name="apertura"]')];
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
  const requestedFinish = new URLSearchParams(location.search).get('acabado');
  let finish = finishes.find(input => input.value === requestedFinish) || finishes.find(input => input.checked);
  let frame = 'marco-y-contramarco';
  let opening = 'simple';
  const dialog = document.querySelector('#query-dialog');
  const message = document.querySelector('#query-message');
  const whatsapp = document.querySelector('#query-whatsapp');
  let displayedFinish = document.querySelector('#leaf-render-caption').textContent;

  function updateSummary() {
    document.querySelector('#query-finish').textContent = finish.dataset.name;
    document.querySelector('#query-frame').textContent = opening.startsWith('corrediza')
      ? 'A definir para apertura corrediza' : frames[frame].name;
    document.querySelector('#query-opening').textContent = openings[opening];
  }

  async function renderFinish(animate = false) {
    const selected = finish.dataset;
    finishes.forEach(input => { input.checked = input === finish; });
    const render = document.querySelector('#leaf-render-image');
    const texture = document.querySelector('#wood-detail-image');
    const room = modelRooms[selected.room];
    const roomImage = document.querySelector('#leaf-room-image');
    const caption = document.querySelector('#leaf-render-caption');
    const status = document.querySelector('#finish-status');
    const roomSrc = `assets/img/${room.image}`;
    const roomSrcset = room.srcset.split(', ').map(source => `assets/img/${source}`).join(', ');
    updateSummary();
    if (animate) {
      caption.textContent = `Cargando vista de ${selected.name}…`;
      status.textContent = `Cargando ${selected.name}.`;
    }
    const result = await window.FinishMotion(document.querySelector('.leaf-finishes'), [
      { image: render, src: `assets/img/${selected.render}` },
      { image: texture, src: `assets/img/${selected.texture}` },
      { image: roomImage, src: roomSrc, srcset: roomSrcset }
    ], () => {
      render.src = `assets/img/${selected.render}`;
      render.alt = selected.renderAlt || `Render oficial de ${model} en ${selected.name.toLowerCase()}, vista frontal con marco`;
      const renderOrigin = document.querySelector('[data-render-origin-label]');
      if (renderOrigin) renderOrigin.textContent = selected.renderOrigin;
      texture.src = `assets/img/${selected.texture}`;
      texture.alt = `Muestra del acabado ${selected.name.toLowerCase()}`;
      roomImage.srcset = roomSrcset;
      roomImage.src = roomSrc;
      roomImage.width = room.width;
      roomImage.height = room.height;
      roomImage.alt = room.alt;
      roomImage.style.objectPosition = room.position;
      roomImage.style.objectFit = room.fit;
      document.querySelector('#leaf-room-caption').textContent = room.caption;
      const source = document.querySelector('#leaf-room-source');
      source.textContent = `${room.source} ↗`;
      source.href = room.href;
      displayedFinish = selected.name;
      caption.textContent = selected.name;
    }, animate);
    if (result === 'failed') {
      caption.textContent = `${displayedFinish} · Vista anterior; no se pudo cargar ${selected.name}.`;
      status.textContent = `Seleccionaste ${selected.name}, pero sus imágenes no pudieron cargarse. Se conserva la vista de ${displayedFinish}.`;
    } else if (animate && result === 'updated') {
      status.textContent = `${selected.name}: render y muestra actualizados. El ambiente se presenta como referencia de inspiración.`;
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

  finishes.forEach(input => input.addEventListener('change', () => {
    finish = input;
    renderFinish(true);
    const url = new URL(location.href);
    url.searchParams.set('acabado', finish.value);
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
    message.value = `Hola, Marroncelli. Me interesa una puerta para mi proyecto.\n\nHoja: ${model}\nAcabado de interés: ${finish.dataset.name}\nSistema de marco: ${frameName}\nApertura: ${openings[opening]}\n\nQuisiera asesoramiento para confirmar el acabado, las medidas y esta combinación.`;
    whatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(message.value)}`;
    dialog.showModal();
  });
  message.addEventListener('input', () => {
    whatsapp.href = `https://wa.me/5491126696918?text=${encodeURIComponent(message.value)}`;
  });
  renderFinish();
  renderFrame();
})();
