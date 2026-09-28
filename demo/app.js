(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const WHATSAPP = 'https://wa.me/5491126696918';

  /* header */
  const header = $('#header');
  if (document.body.classList.contains('sobre-hero')) {
    const actualizar = () => header.classList.toggle('is-solido', window.scrollY > 24);
    actualizar();
    window.addEventListener('scroll', actualizar, { passive: true });
  }

  /* menú móvil */
  const menuBtn = $('.menu-btn');
  const nav = $('#nav');
  const movil = window.matchMedia('(max-width: 1020px)');
  const cerrarMenu = (devolverFoco) => {
    nav.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    $('.menu-btn__texto').textContent = 'Menú';
    document.body.classList.remove('menu-abierto');
    if (devolverFoco) menuBtn.focus();
  };
  nav.hidden = true;
  menuBtn.addEventListener('click', () => {
    if (menuBtn.getAttribute('aria-expanded') === 'true') return cerrarMenu(false);
    nav.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    $('.menu-btn__texto').textContent = 'Cerrar';
    document.body.classList.add('menu-abierto');
    $('a', nav).focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') cerrarMenu(true);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => { if (movil.matches) cerrarMenu(false); }));
  movil.addEventListener('change', () => cerrarMenu(false));

  /* comparador de marcos (inicio) */
  const MARCOS = {
    interior: {
      nombre: 'Marco buña filo interior', img: 'marco-buna-filo-interior', pdf: 'marco-buna-filo-interior.pdf',
      desc: 'Una buña perimetral separa la pared del marco y dibuja el contorno del vano con una línea de sombra.',
      espesor: '44 o 58 mm', abertura: 'Ancho: paso + 184 mm · Alto: paso + 92 mm',
      alt: 'Ilustración técnica en corte del Marco buña filo interior: buña perimetral entre pared y marco, con la hoja abierta.'
    },
    filomuro: {
      nombre: 'Filo muro', img: 'filo-muro', pdf: 'filo-muro.pdf',
      desc: 'La hoja queda en el plano de la pared, sin contramarcos a la vista. Se ofrece solo para hoja Placa.',
      espesor: '58 mm', abertura: 'Ancho: paso + 134 mm · Alto: paso + 67 mm',
      alt: 'Ilustración técnica en corte del sistema Filo muro: la hoja enchapada queda alineada con el plano de la pared.'
    },
    exterior: {
      nombre: 'Marco buña filo exterior', img: 'marco-buna-filo-exterior', pdf: 'marco-buna-filo-exterior.pdf',
      desc: 'También con buña perimetral, con el encuentro de la hoja resuelto hacia el filo exterior del marco.',
      espesor: '58 mm', abertura: 'Ancho: paso + 184 mm · Alto: paso + 92 mm',
      alt: 'Ilustración técnica en corte del Marco buña filo exterior, con la hoja cerrada y la buña perimetral.'
    },
    contramarco: {
      nombre: 'Marco y contramarco', img: 'marco-y-contramarco', pdf: 'marco-y-contramarco.pdf',
      desc: 'Contramarcos telescópicos, lisos o moldurados, cubren el encuentro con la pared y se regulan según el espesor del tabique.',
      espesor: '44 mm', abertura: 'Con premarco: paso + 144 mm · Sin premarco: paso + 108 mm (ancho)',
      alt: 'Ilustración técnica en corte del sistema Marco y contramarco, con contramarcos de madera sobre la pared.'
    }
  };
  const pestanas = $$('.pestana');
  if (pestanas.length) {
    const panel = $('#panel-marco');
    const elegir = (tab, foco) => {
      const m = MARCOS[tab.dataset.marco];
      pestanas.forEach((t) => {
        const activa = t === tab;
        t.setAttribute('aria-selected', activa);
        t.tabIndex = activa ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      const img = $('#marco-img');
      img.src = `assets/img/${m.img}-800.webp`;
      img.alt = m.alt;
      $('#marco-nombre').textContent = m.nombre;
      $('#marco-desc').textContent = m.desc;
      $('#marco-espesor').textContent = m.espesor;
      $('#marco-abertura').textContent = m.abertura;
      $('#marco-pdf').href = `assets/pdf/${m.pdf}`;
      if (foco) tab.focus();
    };
    pestanas.forEach((tab, i) => {
      tab.addEventListener('click', () => elegir(tab));
      tab.addEventListener('keydown', (e) => {
        const mov = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (mov) { e.preventDefault(); elegir(pestanas[(i + mov + pestanas.length) % pestanas.length], true); }
        if (e.key === 'Home') { e.preventDefault(); elegir(pestanas[0], true); }
        if (e.key === 'End') { e.preventDefault(); elegir(pestanas[pestanas.length - 1], true); }
      });
    });
  }

  /* galería (ficha) */
  const miniaturas = $$('.miniaturas button');
  miniaturas.forEach((btn) => btn.addEventListener('click', () => {
    miniaturas.forEach((b) => b.setAttribute('aria-current', b === btn));
    const img = $('#galeria-img');
    img.src = btn.dataset.src;
    img.alt = btn.dataset.alt;
    $('#galeria-marco').classList.toggle('es-muestra', btn.hasAttribute('data-muestra'));
    $('#galeria-titulo').textContent = btn.dataset.titulo;
    $('#galeria-nota').textContent = btn.dataset.nota;
  }));

  /* configurador (ficha) */
  const seleccion = { producto: 'Placa enchapada', terminacion: null, apertura: null, marco: null };
  const configurador = $('#configurador');
  const esFicha = Boolean(configurador);
  const textoMarco = () => seleccion.marco || 'A definir';

  const pintarSeleccion = () => {
    const valores = { terminacion: seleccion.terminacion, apertura: seleccion.apertura, marco: seleccion.marco };
    $$('[data-resumen]').forEach((dd) => {
      const clave = dd.dataset.resumen;
      const v = valores[clave];
      dd.textContent = v || (clave === 'marco' ? 'A definir' : 'Sin elegir');
      dd.classList.toggle('sin-elegir', !v);
    });
    $('#estado-terminacion').textContent = seleccion.terminacion ? seleccion.terminacion.replace(' · ', ', ') : 'Sin elegir';
    $('#estado-apertura').textContent = seleccion.apertura || 'Sin elegir';
    $('#estado-marco-link').textContent = `Actual: ${textoMarco()}`;
    pintarContexto();
  };

  if (esFicha) {
    const campoMarcos = $('#marcos-campo');
    const aviso = $('#aviso-corrediza');
    let eraCorrediza = false;
    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'terminacion') seleccion.terminacion = t.value;
      if (t.name === 'marco') seleccion.marco = t.value;
      if (t.name === 'apertura') {
        seleccion.apertura = t.value;
        const corrediza = t.hasAttribute('data-corrediza');
        if (corrediza) {
          $$('input[name="marco"]').forEach((r) => { r.checked = false; });
          seleccion.marco = 'A definir para apertura corrediza';
        } else if (eraCorrediza) {
          seleccion.marco = null;
        }
        campoMarcos.disabled = corrediza;
        aviso.hidden = !corrediza;
        eraCorrediza = corrediza;
      }
      if (['terminacion', 'apertura', 'marco'].includes(t.name)) pintarSeleccion();
    });
    $('#consultar-combinacion').addEventListener('click', () => {
      $('#incluir-seleccion').checked = true;
      pintarContexto();
      setTimeout(() => $('#f-nombre').focus({ preventScroll: true }), 450);
    });
  }

  /* formulario de consulta */
  const form = $('#form-consulta');
  if (!form) return;
  const TIPOS = {
    vivienda: 'Vivienda unifamiliar',
    constructora: 'Constructora o desarrollo',
    producto: 'Consulta de producto o técnica',
    showroom: 'Visita al showroom',
    distribuidores: 'Distribuidores'
  };
  const contexto = $('#contexto');
  const listaContexto = $('#contexto-lista');
  const extra = $('#proyecto-extra');
  const revision = $('#revision');
  let productoInteres = null;

  const fila = (dt, dd) => {
    const div = document.createElement('div');
    const t = document.createElement('dt');
    const d = document.createElement('dd');
    t.textContent = dt;
    d.textContent = dd;
    div.append(t, d);
    return div;
  };
  function pintarContexto() {
    if (esFicha) {
      listaContexto.replaceChildren(
        fila('Producto', seleccion.producto),
        fila('Terminación', seleccion.terminacion || 'Sin elegir'),
        fila('Apertura', seleccion.apertura || 'Sin elegir'),
        fila('Marco de interés', textoMarco())
      );
    } else {
      contexto.hidden = !productoInteres;
      if (productoInteres) listaContexto.replaceChildren(fila('Línea', productoInteres));
    }
  }

  const tipoActual = () => ($('input[name="tipo"]:checked', form) || {}).value;
  const actualizarTipo = () => {
    const t = tipoActual();
    extra.hidden = !(t === 'vivienda' || t === 'constructora');
  };
  const ocultarRevision = () => { revision.hidden = true; };

  $$('[data-consulta]').forEach((a) => a.addEventListener('click', () => {
    const radio = $(`input[name="tipo"][value="${a.dataset.tipo}"]`, form);
    if (radio) radio.checked = true;
    productoInteres = a.dataset.producto || null;
    actualizarTipo();
    pintarContexto();
    ocultarRevision();
    setTimeout(() => $('#f-nombre').focus({ preventScroll: true }), 450);
  }));
  const quitar = $('#quitar-contexto');
  if (quitar) quitar.addEventListener('click', () => {
    productoInteres = null;
    pintarContexto();
    ocultarRevision();
    $('#f-nombre').focus();
  });

  form.addEventListener('change', (e) => {
    if (e.target.name === 'tipo') actualizarTipo();
    ocultarRevision();
  });
  form.addEventListener('input', ocultarRevision);
  if (esFicha) document.addEventListener('change', (e) => { if (['terminacion', 'apertura', 'marco'].includes(e.target.name)) ocultarRevision(); });

  const error = (campo, idError, texto) => {
    $(`#${idError}`).textContent = texto;
    if (campo) campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
    return !texto;
  };

  const armarMensaje = () => {
    const v = (id) => $(id).value.trim();
    const lineas = ['Hola, Marroncelli. Les escribo desde la web.', '', `Nombre: ${v('#f-nombre')}`, `Contacto: ${v('#f-contacto')}`, `Tipo de consulta: ${TIPOS[tipoActual()]}`];
    if (!extra.hidden) {
      if (v('#f-empresa')) lineas.push(`Empresa o estudio: ${v('#f-empresa')}`);
      if (v('#f-ubicacion')) lineas.push(`Ubicación de la obra: ${v('#f-ubicacion')}`);
      if (v('#f-cantidad')) lineas.push(`Cantidad estimada de puertas: ${v('#f-cantidad')}`);
    }
    if (esFicha && $('#incluir-seleccion').checked) {
      lineas.push('', 'Selección de interés:',
        `- Producto: ${seleccion.producto}`,
        `- Terminación: ${seleccion.terminacion || 'a definir'}`,
        `- Apertura: ${seleccion.apertura || 'a definir'}`,
        `- Marco: ${seleccion.marco || 'a definir'}`,
        'Entiendo que la combinación y las medidas se confirman con el equipo comercial.');
    }
    if (!esFicha && productoInteres) lineas.push(`Línea de interés: ${productoInteres}`);
    if (v('#f-mensaje')) lineas.push('', 'Mensaje:', v('#f-mensaje'));
    return lineas.join('\n');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = $('#f-nombre');
    const cont = $('#f-contacto');
    const valorContacto = cont.value.trim();
    const pareceMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorContacto);
    const pareceTel = (valorContacto.match(/\d/g) || []).length >= 8;
    const ok = [
      error(nombre, 'e-nombre', nombre.value.trim() ? '' : 'Escribí tu nombre.'),
      error(cont, 'e-contacto', !valorContacto ? 'Dejanos un correo o un teléfono.' : (pareceMail || pareceTel ? '' : 'Revisá el correo o el teléfono.')),
      error(null, 'e-tipo', tipoActual() ? '' : 'Elegí un tipo de consulta.')
    ];
    if (ok.includes(false)) {
      const primero = [nombre, cont, $('input[name="tipo"]', form)][ok.indexOf(false)];
      primero.focus();
      return;
    }
    const texto = armarMensaje();
    $('#revision-mensaje').textContent = texto;
    $('#whatsapp').href = `${WHATSAPP}?text=${encodeURIComponent(texto)}`;
    revision.hidden = false;
    $('#revision-titulo').focus();
  });
  $('#editar').addEventListener('click', () => {
    ocultarRevision();
    $('#f-nombre').focus();
  });

  actualizarTipo();
  if (esFicha) pintarSeleccion(); else pintarContexto();
})();
