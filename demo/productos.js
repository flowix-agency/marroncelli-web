(() => {
  const lines = {
    placa: {
      name: 'Placa enchapada', kicker: '01 / La continuidad de la madera',
      description: 'Líneas simples y superficies de madera natural o reconstituida. Una puerta para acompañar el carácter de tu interior.',
      finishes: {
        nogal: { name: 'Nogal rayado', image: 'placa-en-nogal-rayado-a2-grande.webp', swatch: 'enchapada-nogal-rayado-miniatura.webp', room: 'nogal' },
        roble: { name: 'Roble floreado', image: 'placa-en-roble-floreado-a1-grande.webp', swatch: 'enchapado-de-madera-roble-floreado-miniatura.webp', room: 'roble' }
      }
    },
    aldeana: {
      name: 'Aldeana', kicker: '02 / El detalle de los tableros',
      description: 'Tableros de perfil ligero, enchapados de madera y opción pintada en blanco. Una puerta que aporta ritmo y detalle al ambiente.',
      allFinishes: 'Enchapados naturales: nogal floreado, roble floreado y roble rayado. Reconstituidos: nogal floreado o rayado, roble floreado o rayado, ébano y gris decape. También pintada en blanco.',
      finishes: {
        nogal: { name: 'Nogal rayado', image: 'aldeana-en-nogal-rayado-a2-grande.webp', swatch: 'enchapada-nogal-rayado-miniatura.webp', room: 'tableros-nogal' },
        roble: { name: 'Roble floreado', image: 'aldeana-en-roble-floreado-a1-grande.webp', swatch: 'enchapado-de-madera-roble-floreado-miniatura.webp', room: 'tableros-roble' },
        blanco: { name: 'Blanco', image: 'aldeana-pin-blanco-a1-grande.webp', swatch: 'blanco-miniatura.webp', room: 'tableros-blanco' }
      }
    },
    burdeos: {
      name: 'Burdeos', kicker: '03 / Una presencia clásica',
      description: 'Tableros definidos, con opciones de nogal macizo o terminación pintada. Una puerta para darle carácter al espacio.',
      allFinishes: 'Nogal macizo, con terminación al agua sin tintes. Pintada en blanco, gris, negro, rosa o verde. En esta vista podés explorar nogal y blanco.',
      finishes: {
        nogal: { name: 'Nogal macizo', image: 'burdeos-mad-nogal-a1-grande.webp', swatch: 'madera-maciza-nogal-miniatura.webp', room: 'tableros-nogal' },
        blanco: { name: 'Blanco', image: 'burdeos-pin-blanco-a1-grande.webp', swatch: 'blanco-miniatura.webp', room: 'tableros-blanco' }
      }
    }
  };
  const selectedFinishes = { placa: 'nogal', aldeana: 'roble', burdeos: 'blanco' };
  const articles = [...document.querySelectorAll('[data-product]')];
  const displayedFinishes = { ...selectedFinishes };
  async function selectFinish(article, key) {
    const product = article.dataset.product;
    selectedFinishes[product] = key;
    const line = lines[product];
    const finish = line.finishes[key];
    article.querySelectorAll('[data-finish]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.finish === key));
    });
    const image = article.querySelector('.product-render img');
    const room = article.querySelector(`[data-room="${finish.room}"]`);
    const currentRoom = article.querySelector('[data-room].is-active');
    const caption = article.querySelector('.product-render figcaption');
    const status = article.querySelector('.product-status');
    const page = product === 'placa' ? 'placa-enchapada' : product;
    article.querySelector('.product-main-link').href = `${page}.html?acabado=${key}`;
    article.querySelector('.product-small-link').href = `${page}.html?acabado=${key}#acabados`;
    caption.textContent = `Cargando vista de ${finish.name}…`;
    status.textContent = `Cargando ${line.name}, ${finish.name}.`;
    const result = await window.FinishMotion(article, [
      { image, src: `assets/img/${finish.image}` },
      { image: currentRoom, nextImage: room, src: room.src, srcset: room.srcset }
    ], () => {
      image.src = `assets/img/${finish.image}`;
      image.alt = `Render oficial de ${line.name} en ${finish.name.toLowerCase()}, vista frontal con marco`;
      article.querySelectorAll('[data-room]').forEach(candidate => {
        const active = candidate.dataset.room === finish.room;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-hidden', String(!active));
      });
      const source = article.querySelector('.product-room-source');
      source.href = room.dataset.sourceUrl;
      source.replaceChildren(document.createTextNode(`Fuente: ${room.dataset.source} `));
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      source.append(arrow);
      displayedFinishes[product] = key;
      caption.textContent = `Render de referencia · ${finish.name}`;
    });
    if (result === 'failed') {
      const previousName = line.finishes[displayedFinishes[product]].name;
      caption.textContent = `${previousName} · Vista anterior; no se pudo cargar ${finish.name}.`;
      status.textContent = `Seleccionaste ${finish.name}, pero sus imágenes no pudieron cargarse. Se conserva la vista de ${previousName}.`;
    } else if (result === 'updated') {
      status.textContent = `${line.name}, ${finish.name}. Vista de la hoja y ambiente de referencia actualizados.`;
    }
  }
  articles.forEach(article => {
    article.querySelectorAll('[data-finish]').forEach(button => button.addEventListener('click', () => selectFinish(article, button.dataset.finish)));
  });

})();
