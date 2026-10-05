(() => {
  const root = document.getElementById('medidas-burdeos');
  if (!root) return;

  const source = new URL('assets/burdeos-medidas/step-profiles.json', document.currentScript.src);
  const status = root.querySelector('.burdeos-measures-status');
  const retry = root.querySelector('.burdeos-measures-retry');
  const lab = root.querySelector('.burdeos-measures-lab');
  let loading = false;
  let profiles;

  async function openDiagram() {
    if (!root.open || loading || profiles) return;
    loading = true;
    retry.hidden = true;
    status.hidden = false;
    status.textContent = 'Cargando el esquema de Burdeos…';
    lab.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error('No se pudieron cargar los perfiles.');
      profiles = await response.json();
      initialize();
      status.hidden = true;
    } catch {
      profiles = undefined;
      lab.hidden = true;
      status.textContent = 'No pudimos cargar el esquema. Podés volver a intentarlo.';
      retry.hidden = false;
    } finally {
      loading = false;
      lab.setAttribute('aria-busy', 'false');
    }
  }

  root.addEventListener('toggle', openDiagram);
  retry.addEventListener('click', openDiagram);
  openDiagram();

  function initialize() {
    lab.innerHTML = `
      <div class="burdeos-measures-title">
        <div><span>Una hoja / Esquema de medidas</span><h3>Del hueco de pared al paso.</h3></div>
        <span class="burdeos-measures-unit">Milímetros</span>
      </div>
      <div class="burdeos-measures-tabs" role="group" aria-label="Medida destacada en el esquema">
        <button type="button" data-cota="pass" aria-pressed="true">Paso</button>
        <button type="button" data-cota="frame" aria-pressed="false">Vano marco</button>
        <button type="button" data-cota="masonry" aria-pressed="false">Libre mampostería</button>
      </div>
      <div class="burdeos-measures-orientation" role="group" aria-label="Vista del esquema">
        <button type="button" data-axis="width" aria-pressed="true">Anchos · corte horizontal</button>
        <button type="button" data-axis="height" aria-pressed="false">Altos · vista frontal</button>
      </div>
      <svg class="burdeos-measures-svg" role="img"></svg>
      <div class="burdeos-measures-legend">
        <span><i style="--legend-color: #c5b393"></i>Hoja Burdeos</span>
        <span><i style="--legend-color: #8b8170"></i>Marco</span>
        <span><i style="--legend-color: #bdb5a6"></i>Contramarcos</span>
        <span><i style="--legend-color: #a78b65"></i>Premarco</span>
      </div>
      <p class="burdeos-measures-definition" aria-live="polite"></p>
      <div class="burdeos-measures-controls">
        <label for="burdeos-std-width">Ancho de paso <output id="burdeos-std-width-value" for="burdeos-std-width">610 mm</output>
          <input id="burdeos-std-width" type="range" min="0" max="3" step="1" value="0" aria-describedby="burdeos-std-width-stops">
          <span class="burdeos-measures-stops" id="burdeos-std-width-stops">610 · 710 · 810 · 910 mm</span>
        </label>
        <label for="burdeos-std-height">Alto de paso <output id="burdeos-std-height-value" for="burdeos-std-height">2020 mm</output>
          <input id="burdeos-std-height" type="range" min="0" max="3" step="1" value="0" aria-describedby="burdeos-std-height-stops">
          <span class="burdeos-measures-stops" id="burdeos-std-height-stops">2020 · 2220 · 2420 · 2620 mm</span>
        </label>
        <label for="burdeos-std-angle">Apertura ilustrativa <output id="burdeos-std-angle-value" for="burdeos-std-angle">35°</output>
          <input id="burdeos-std-angle" type="range" min="0" max="100" step="1" value="35" aria-describedby="burdeos-std-angle-note">
          <span class="burdeos-measures-stops" id="burdeos-std-angle-note">Disponible en el corte horizontal.</span>
        </label>
        <label class="burdeos-measures-premarco" for="burdeos-std-pre"><input id="burdeos-std-pre" type="checkbox" checked>Con premarco
          <span class="burdeos-measures-stops">Actualiza el hueco necesario en la pared.</span>
        </label>
      </div>
      <dl class="burdeos-measures-results" aria-live="polite"></dl>
      <div class="burdeos-measures-footer">
        <p>Usá los controles o arrastrá los puntos de la cota destacada. El esquema se ajusta a la medida estándar más cercana.</p>
        <button type="button" id="burdeos-std-download">Descargar esquema SVG ↓</button>
      </div>
      <p class="burdeos-measures-disclaimer">Esquema ilustrativo, no es un plano de fabricación. La geometría proviene del modelo recibido y los otros tamaños adaptan sus largos de forma esquemática. El paso, la hoja y la libre mampostería toman como referencia la ficha 004; el vano marco es calculado. La disponibilidad de estas medidas para Burdeos se confirma con el equipo comercial. Este esquema es independiente del visor 3D, que conserva la hoja original de 624 × 2019 mm.</p>`;
    lab.hidden = false;

    const $ = selector => lab.querySelector(selector);
    const svg = $('.burdeos-measures-svg');
    const widths = [610, 710, 810, 910];
    const heights = [2020, 2220, 2420, 2620];
    const labels = { pass: 'Paso', frame: 'Vano marco calculado', masonry: 'Libre mampostería' };
    const definitions = {
      pass: 'Paso: abertura interior más angosta del marco, por donde pasa la persona.',
      frame: 'Vano marco calculado: medida exterior del cuerpo del marco, sin contramarcos ni premarco.',
      masonry: 'Libre mampostería: hueco de la pared donde se instala el conjunto. Cambia al incorporar un premarco.'
    };
    let wi = 0;
    let hi = 0;
    let angle = 35;
    let pre = true;
    let cota = 'pass';
    let axis = 'width';
    let drag;
    let geometry;
    let renderedWidth;
    const measures = () => ({
      pass: [widths[wi], heights[hi]],
      frame: [widths[wi] + 88, heights[hi] + 44],
      masonry: [widths[wi] + (pre ? 144 : 108), heights[hi] + (pre ? 72 : 54)],
      leaf: [widths[wi] + 14, heights[hi] - 1]
    });
    const text = (x, y, value, anchor = 'middle', color = '#696356') =>
      `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="Arial, sans-serif" font-size="13">${value}</text>`;

    function render() {
      const m = measures();
      const W = Math.max(320, Math.round(svg.clientWidth));
      const H = axis === 'width' ? 610 : 520;
      const mid = W / 2;
      renderedWidth = svg.clientWidth;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.dataset.axisView = axis;
      svg.setAttribute('aria-label', `${axis === 'width' ? 'Anchos en corte horizontal' : 'Altos en vista frontal'}. ${Object.keys(labels).map(key => `${labels[key]}: ${m[key][axis === 'width' ? 0 : 1]} milímetros`).join('. ')}. ${pre ? 'Con' : 'Sin'} premarco. Esquema ilustrativo.`);
      let out = '<defs><pattern id="burdeos-std-wall" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-2,2L2,-2M0,7L7,0M5,9L9,5" stroke="#b9b2a5" stroke-width=".7"/></pattern></defs>';

      if (axis === 'width') {
        const pass = m.pass[0];
        const free = m.masonry[0];
        const delta = pass - 610;
        const rad = angle * Math.PI / 180;
        const hinge = -(pass + 14) / 2;
        const visible = profiles.filter(part => pre || !part.name.includes('PREMARCO'));
        const transform = (point, part) => {
          let x = point[0] + (Math.abs(part.center[0]) > 250 ? Math.sign(part.center[0]) * delta / 2 : Math.max(-1, Math.min(1, point[0] / 150)) * delta / 2);
          let z = point[1];
          if (part.name.includes('BURDEOS')) {
            const dx = x - hinge;
            const dz = z + 74;
            x = hinge + dx * Math.cos(rad) + dz * Math.sin(rad);
            z = -74 - dx * Math.sin(rad) + dz * Math.cos(rad);
          }
          return [x, z];
        };
        const points = visible.flatMap(part => part.loops.flatMap(loop => loop.map(point => transform(point, part))));
        const minZ = Math.min(-110, ...points.map(point => point[1])) - 25;
        const maxZ = Math.max(110, ...points.map(point => point[1]));
        const extent = Math.max(free / 2 + 80, ...points.map(point => Math.abs(point[0]) + 25));
        const scale = Math.min((W - 44) / (extent * 2), 340 / (maxZ - minZ));
        const y = 35 - minZ * scale;
        const at = mm => mid + mm * scale;
        const zt = mm => y + mm * scale;
        geometry = { scale, W };
        const lx = at(-free / 2);
        const lr = at(free / 2);
        out += `<rect x="10" y="${zt(-75)}" width="${lx - 10}" height="${150 * scale}" fill="url(#burdeos-std-wall)" stroke="#9a9284"/><rect x="${lr}" y="${zt(-75)}" width="${W - 10 - lr}" height="${150 * scale}" fill="url(#burdeos-std-wall)" stroke="#9a9284"/>`;
        for (const part of visible) {
          const color = part.name.includes('PREMARCO') ? '#a78b65' : part.name.includes('BURDEOS') ? (part.name.includes('TABLERO') ? '#e6dac2' : '#c5b393') : part.name.startsWith('CM_') ? '#bdb5a6' : '#8b8170';
          for (const loop of part.loops) {
            const path = loop.map((point, index) => {
              const q = transform(point, part);
              return `${index ? 'L' : 'M'}${at(q[0])},${zt(q[1])}`;
            }).join(' ');
            out += `<path data-step-component="${part.name}" d="${path}Z" fill="${color}" stroke="#665b48" stroke-width=".7" stroke-linejoin="round"/>`;
          }
        }
        out += `<circle cx="${at(hinge)}" cy="${zt(-74)}" r="3" fill="#806b43"/>`;
        const bottom = zt(90);
        const selected = m[cota][0] / 2;
        out += `<rect x="${at(-selected)}" y="${bottom + 8}" width="${selected * 2 * scale}" height="18" fill="#806b43" opacity=".12"/>`;
        ['masonry', 'frame', 'pass'].forEach((key, index) => {
          const l = at(-m[key][0] / 2);
          const r = at(m[key][0] / 2);
          const yy = bottom + 55 + index * 57;
          const active = key === cota;
          const color = active ? '#806b43' : '#888074';
          out += `<path d="M${l},${bottom + 4}V${yy + 6}M${r},${bottom + 4}V${yy + 6}" stroke="#c7c0b3"/><path d="M${l},${yy}H${r}M${l - 3},${yy + 4}l6,-8M${r - 3},${yy + 4}l6,-8" stroke="${color}" stroke-width="${active ? 1.7 : 1}"/>`;
          out += text(mid, yy - 12, `${labels[key]} · ${m[key][0]} mm`, 'middle', active ? '#534328' : '#696356');
          if (active) {
            for (const [x, side] of [[l, -1], [r, 1]]) {
              out += `<circle cx="${x}" cy="${yy}" r="4" fill="#806b43"/><circle data-handle="${side}" cx="${x}" cy="${yy}" r="22" fill="transparent" class="burdeos-measures-handle"/>`;
            }
          }
        });
      } else {
        const freeW = m.masonry[0];
        const scale = Math.min((H - 95) / 2800, (W * .5 - 28) / (freeW + 100));
        const base = H - 37;
        const cx = W * .29;
        const dw = m.pass[0] - 610;
        const dh = m.pass[1] - 2020;
        geometry = { scale, W };
        const mapFront = (point, part) => {
          const x = point[0] + (Math.abs(part.center[0]) > 250 ? Math.sign(part.center[0]) * dw / 2 : Math.max(-1, Math.min(1, point[0] / 150)) * dw / 2);
          const y = point[1] + Math.max(0, Math.min(1, (point[1] - 877) / (1903 - 877))) * dh;
          return [cx + x * scale, base - y * scale];
        };
        for (const part of profiles) {
          if (!pre && part.name.includes('PREMARCO')) continue;
          const stroke = part.name.includes('PREMARCO') ? '#9d7e50' : part.name.includes('BURDEOS') ? '#806b43' : part.name.startsWith('CM_') ? '#aaa08e' : '#6f685d';
          const path = part.front.map(edge => edge.map((point, index) => `${index ? 'L' : 'M'}${mapFront(point, part).join(',')}`).join(' ')).join(' ');
          out += `<path data-step-component="${part.name}" d="${path}" fill="none" stroke="${stroke}" stroke-width=".8"/>`;
        }
        const h = m[cota][1];
        const yy = base - h * scale;
        const xx = W * .7;
        const edge = cx + m[cota][0] / 2 * scale;
        out += `<path d="M${edge},${yy}H${xx + 8}M${edge},${base}H${xx + 8}" stroke="#c7c0b3"/><path d="M${xx},${yy}V${base}M${xx - 4},${yy + 3}l8,-6M${xx - 4},${base + 3}l8,-6" stroke="#806b43" stroke-width="1.6"/><circle cx="${xx}" cy="${yy}" r="4" fill="#806b43"/><circle data-handle="-1" cx="${xx}" cy="${yy}" r="22" fill="transparent" class="burdeos-measures-handle"/>`;
        out += text(mid, 23, `${labels[cota]} · ${h} mm`, 'middle', '#534328');
        out += text(xx + 12, (yy + base) / 2, `${h} mm`, 'start', '#534328');
      }

      svg.innerHTML = out;
      $('.burdeos-measures-definition').textContent = definitions[cota];
      $('#burdeos-std-width-value').textContent = `${m.pass[0]} mm`;
      $('#burdeos-std-height-value').textContent = `${m.pass[1]} mm`;
      $('#burdeos-std-angle-value').textContent = `${angle}°`;
      $('#burdeos-std-width').value = wi;
      $('#burdeos-std-width').setAttribute('aria-valuetext', `${m.pass[0]} milímetros`);
      $('#burdeos-std-height').value = hi;
      $('#burdeos-std-height').setAttribute('aria-valuetext', `${m.pass[1]} milímetros`);
      $('#burdeos-std-angle').value = angle;
      $('#burdeos-std-angle').setAttribute('aria-valuetext', `${angle} grados`);
      $('#burdeos-std-angle').disabled = axis === 'height';
      $('#burdeos-std-pre').checked = pre;
      lab.querySelectorAll('[data-cota]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cota === cota)));
      lab.querySelectorAll('[data-axis]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.axis === axis)));
      $('.burdeos-measures-results').innerHTML = `<div><dt>Hoja</dt><dd>${m.leaf[0]} × ${m.leaf[1]} mm</dd></div><div><dt>Vano marco calculado</dt><dd>${m.frame[0]} × ${m.frame[1]} mm</dd></div><div><dt>Libre mampostería</dt><dd>${m.masonry[0]} × ${m.masonry[1]} mm</dd></div>`;
    }

    $('#burdeos-std-width').addEventListener('input', event => { wi = +event.target.value; render(); });
    $('#burdeos-std-height').addEventListener('input', event => { hi = +event.target.value; render(); });
    $('#burdeos-std-angle').addEventListener('input', event => { angle = +event.target.value; render(); });
    $('#burdeos-std-pre').addEventListener('change', event => { pre = event.target.checked; render(); });
    lab.querySelectorAll('[data-cota]').forEach(button => button.addEventListener('click', () => { cota = button.dataset.cota; render(); }));
    lab.querySelectorAll('[data-axis]').forEach(button => button.addEventListener('click', () => { axis = button.dataset.axis; drag = undefined; render(); }));

    svg.addEventListener('pointerdown', event => {
      const handle = event.target.closest('[data-handle]');
      if (!handle || event.button !== 0) return;
      event.preventDefault();
      drag = { x: event.clientX, y: event.clientY, side: +handle.dataset.handle, width: widths[wi], height: heights[hi], scale: geometry.scale, ratio: geometry.W / svg.getBoundingClientRect().width };
      svg.setPointerCapture(event.pointerId);
    });
    svg.addEventListener('pointermove', event => {
      if (!drag) return;
      if (axis === 'width') {
        const desired = drag.width + (event.clientX - drag.x) * drag.side * 2 * drag.ratio / drag.scale;
        wi = widths.reduce((best, value, index) => Math.abs(value - desired) < Math.abs(widths[best] - desired) ? index : best, 0);
      } else {
        const desired = drag.height - (event.clientY - drag.y) * drag.ratio / drag.scale;
        hi = heights.reduce((best, value, index) => Math.abs(value - desired) < Math.abs(heights[best] - desired) ? index : best, 0);
      }
      render();
    });
    svg.addEventListener('pointerup', () => { drag = undefined; });
    svg.addEventListener('pointercancel', () => { drag = undefined; });
    svg.addEventListener('lostpointercapture', () => { drag = undefined; });

    $('#burdeos-std-download').addEventListener('click', () => {
      const copy = svg.cloneNode(true);
      const m = measures();
      const [,, W, H] = copy.getAttribute('viewBox').split(' ').map(Number);
      copy.querySelectorAll('.burdeos-measures-handle').forEach(handle => handle.remove());
      copy.setAttribute('x', '0');
      copy.setAttribute('y', '116');
      copy.setAttribute('width', W);
      copy.setAttribute('height', H);
      const notes = [
        'BURDEOS / ESQUEMA ILUSTRATIVO',
        `${axis === 'width' ? 'Corte horizontal' : 'Vista frontal'} · ${pre ? 'Con' : 'Sin'} premarco`,
        `Paso: ${m.pass.join(' × ')} mm · Hoja: ${m.leaf.join(' × ')} mm`,
        'Medidas disponibles para Burdeos a confirmar.',
        'Geometría adaptada de forma esquemática.',
        'No es un plano de fabricación.'
      ];
      const exported = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 206}" viewBox="0 0 ${W} ${H + 206}"><title>Burdeos. Esquema ilustrativo de medidas.</title><rect width="100%" height="100%" fill="#f7f6f2"/>${notes.slice(0, 3).map((line, index) => text(16, 27 + index * 27, line, 'start', '#302e29')).join('')}${new XMLSerializer().serializeToString(copy)}${notes.slice(3).map((line, index) => text(16, H + 138 + index * 22, line, 'start')).join('')}</svg>`;
      const url = URL.createObjectURL(new Blob([exported], { type: 'image/svg+xml' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `burdeos-esquema-${m.pass.join('x')}-${axis === 'width' ? 'anchos' : 'altos'}-${pre ? 'con' : 'sin'}-premarco.svg`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });

    new ResizeObserver(() => {
      if (root.open && svg.clientWidth !== renderedWidth) render();
    }).observe(lab);
    render();
  }
})();
