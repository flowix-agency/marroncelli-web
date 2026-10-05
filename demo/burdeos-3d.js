(() => {
  const viewer = document.querySelector('[data-burdeos-3d]');
  const stage = viewer.querySelector('.burdeos3d-stage');
  const poster = viewer.querySelector('.burdeos3d-poster');
  const start = viewer.querySelector('[data-burdeos3d-start]');
  const status = viewer.querySelector('[data-burdeos3d-status]');
  const fieldset = viewer.querySelector('.burdeos3d-controls');
  const assembly = viewer.querySelector('[data-burdeos3d-assembly]');
  const opening = viewer.querySelector('[data-burdeos3d-opening]');
  const separation = viewer.querySelector('[data-burdeos3d-separation]');
  const radios = [...document.querySelectorAll('input[name="acabado"]')];
  const finishes = {
    blanco: { name: 'Blanco', color: '#e2e0d7' },
    gris: { name: 'Gris', color: '#a7a39a' },
    negro: { name: 'Negro', color: '#30322f' },
    rosa: { name: 'Rosa', color: '#bc8588' },
    verde: { name: 'Verde', color: '#939f6c' },
    nogal: { name: 'Nogal', color: '#916844' }
  };
  const asset = 'assets/burdeos-3d/';
  let leafFinish = radios.find(input => input.checked).value;
  let frameFinish = 'blanco';
  let loading = false;
  let inView = false;
  let draw;
  let applyModel;
  let stopAnimation = () => {};

  function syncFinishLabels() {
    viewer.querySelectorAll('[data-burdeos3d-finish]').forEach(button => {
      const current = button.dataset.part === 'leaf' ? leafFinish : frameFinish;
      button.setAttribute('aria-pressed', String(button.dataset.burdeos3dFinish === current));
    });
    viewer.querySelector('[data-burdeos3d-leaf-name]').textContent = finishes[leafFinish].name;
    viewer.querySelector('[data-burdeos3d-frame-name]').textContent = finishes[frameFinish].name;
    viewer.querySelector('[data-burdeos3d-summary]').textContent = `Hoja ${finishes[leafFinish].name.toLowerCase()} · marco ${finishes[frameFinish].name.toLowerCase()}`;
    poster.src = `${asset}burdeos-${leafFinish}.webp`;
    poster.alt = `Render de estudio de Burdeos en ${finishes[leafFinish].name.toLowerCase()}; la vista previa muestra hoja y marco del mismo acabado`;
    viewer.querySelector('[data-burdeos3d-walnut-note]').hidden = leafFinish !== 'nogal';
  }

  function syncCommercialNote() {
    const frame = document.querySelector('input[name="marco"]:checked');
    const doorOpening = document.querySelector('input[name="apertura"]:checked');
    viewer.querySelector('[data-burdeos3d-combination-note]').hidden = frame?.value === 'marco-y-contramarco' && doorOpening?.value === 'simple';
  }

  radios.forEach(input => input.addEventListener('change', () => {
    leafFinish = input.value;
    syncFinishLabels();
    applyModel?.();
  }));
  document.querySelectorAll('input[name="marco"], input[name="apertura"]').forEach(input => input.addEventListener('change', syncCommercialNote));
  viewer.querySelectorAll('[data-burdeos3d-finish]').forEach(button => button.addEventListener('click', () => {
    const finish = button.dataset.burdeos3dFinish;
    if (button.dataset.part === 'leaf') {
      const radio = radios.find(input => input.value === finish);
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      frameFinish = finish;
      syncFinishLabels();
      applyModel?.();
    }
  }));
  syncFinishLabels();
  syncCommercialNote();

  async function initialize() {
    if (loading || viewer.dataset.state === 'ready') return;
    loading = true;
    viewer.dataset.state = 'loading';
    start.disabled = true;
    status.textContent = 'Preparando el modelo de Burdeos…';
    let renderer;
    let scene;

    try {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import('./assets/burdeos-3d/vendor/three.module.js'),
        import('./assets/burdeos-3d/vendor/GLTFLoader.js')
      ]);
      const loader = new GLTFLoader();
      const [leaf, frame, withPre, wood] = await Promise.all([
        loader.loadAsync(`${asset}HOJA_BURDEOS.glb`),
        loader.loadAsync(`${asset}MARCO_CONTRAMARCO.glb`),
        loader.loadAsync(`${asset}MARCO_CONTRAMARCO_CONPREMARCO.glb`),
        new THREE.TextureLoader().loadAsync('assets/img/madera-maciza-nogal-grande.webp')
      ]);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, matchMedia('(max-width: 760px)').matches ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, .01, 30);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xb5aa94, 1.6));
      const key = new THREE.DirectionalLight(0xfffaf0, 2.5);
      key.position.set(-3, 5, -4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 15 });
      key.shadow.camera.updateProjectionMatrix();
      key.shadow.normalBias = .002;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 1.5);
      fill.position.set(3, 3, 3);
      scene.add(fill);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: .15 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -.002;
      floor.receiveShadow = true;
      scene.add(floor);

      const leafPivot = new THREE.Group();
      leafPivot.name = 'Pivote ilustrativo de apertura';
      leafPivot.position.set(-.312, .008, -.074);
      const leafPlacement = new THREE.Group();
      leafPlacement.position.set(.312, 0, .022);
      leafPlacement.add(leaf.scene);
      leafPivot.add(leafPlacement);
      scene.add(leafPivot, frame.scene, withPre.scene);
      const pieces = [];
      const originalMaterials = new Set();
      for (const [data, part] of [[leaf, 'leaf'], [frame, 'frame'], [withPre, 'pre']]) {
        data.scene.traverse(mesh => {
          if (!mesh.isMesh) return;
          if (part === 'pre' && !mesh.name.includes('PREMARCO')) { mesh.visible = false; return; }
          originalMaterials.add(mesh.material);
          mesh.castShadow = true;
          const positions = mesh.geometry.attributes.position;
          mesh.geometry.computeBoundingBox();
          const bounds = mesh.geometry.boundingBox;
          const dimensions = bounds.getSize(new THREE.Vector3());
          const uv = new Float32Array(positions.count * 2);
          for (let i = 0; i < positions.count; i++) {
            uv[i * 2] = (positions.getX(i) - bounds.min.x) / (dimensions.x || 1);
            uv[i * 2 + 1] = (positions.getY(i) - bounds.min.y) / (dimensions.y || 1);
          }
          mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          pieces.push({ mesh, part, base: mesh.position.clone(), horizontal: /CABEZAL|TRAVESANO|ZOCALO/.test(mesh.name) });
        });
      }

      wood.colorSpace = THREE.SRGBColorSpace;
      wood.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const woodHorizontal = wood.clone();
      woodHorizontal.center.set(.5, .5);
      woodHorizontal.rotation = Math.PI / 2;
      woodHorizontal.needsUpdate = true;
      const materials = {};
      for (const [id, finish] of Object.entries(finishes)) {
        materials[id] = [false, true].map(horizontal => new THREE.MeshStandardMaterial({
          color: id === 'nogal' ? 0xffffff : finish.color,
          map: id === 'nogal' ? (horizontal ? woodHorizontal : wood) : null,
          roughness: id === 'nogal' ? .55 : .38,
          metalness: 0
        }));
      }
      const rawWood = new THREE.MeshStandardMaterial({ color: 0xb09a76, roughness: .72 });
      const leafVisible = viewer.querySelector('[data-burdeos3d-part="leaf"]');
      const frameVisible = viewer.querySelector('[data-burdeos3d-part="frame"]');
      const preVisible = viewer.querySelector('[data-burdeos3d-part="pre"]');
      const canvas = renderer.domElement;
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Modelo 3D de estudio de Burdeos con marco y contramarco');
      canvas.setAttribute('aria-describedby', 'burdeos3d-help');
      stage.append(canvas);
      let yaw = Math.PI - .32;
      let pitch = .13;
      let fitDistance = 4.4;
      let zoom = 1;
      let scheduled = 0;
      let playing = false;
      let animationStart = 0;
      let pointer;

      function requestRender() {
        if (scheduled || !inView || document.hidden) return;
        scheduled = requestAnimationFrame(render);
      }

      function updateModel() {
        leafPivot.visible = leafVisible.checked;
        frame.scene.visible = frameVisible.checked;
        withPre.scene.visible = preVisible.checked;
        opening.disabled = !leafVisible.checked;
        const opened = Number(opening.value);
        const separated = Number(separation.value) / 100;
        leafPivot.rotation.y = THREE.MathUtils.degToRad(opened);
        leafPivot.position.z = -.074 - separated * .55;
        for (const { mesh, part, base, horizontal } of pieces) {
          mesh.position.copy(base);
          if (part === 'frame') {
            if (mesh.name.includes('ALA_CORTA')) mesh.position.z -= separated * .25;
            if (mesh.name.includes('ALA_LARGA')) mesh.position.z += separated * .25;
          }
          if (part === 'pre') mesh.position.z += separated * .5;
          mesh.material = part === 'pre' ? rawWood : materials[part === 'leaf' ? leafFinish : frameFinish][Number(horizontal)];
        }
        viewer.querySelector('[data-burdeos3d-opening-value]').value = `${opened}°`;
        viewer.querySelector('[data-burdeos3d-separation-value]').value = `${separation.value}%`;
        viewer.querySelector('[data-burdeos3d-empty]').hidden = leafVisible.checked || frameVisible.checked || preVisible.checked;
      }

      applyModel = () => { updateModel(); requestRender(); };
      stopAnimation = () => {
        playing = false;
        assembly.textContent = 'Ver secuencia de ensamble';
        assembly.setAttribute('aria-pressed', 'false');
      };

      function render(time) {
        scheduled = 0;
        if (!inView || document.hidden) return;
        if (playing) {
          if (!animationStart) animationStart = time;
          const progress = Math.min(1, (time - animationStart) / 6500);
          const smooth = value => { const t = THREE.MathUtils.clamp(value, 0, 1); return t * t * (3 - 2 * t); };
          separation.value = String(Math.round(100 * (1 - smooth(progress / .6))));
          opening.value = String(Math.round(95 * smooth((progress - .65) / .35)));
          updateModel();
          if (progress === 1) { stopAnimation(); status.textContent = 'Secuencia terminada. Podés seguir explorando el conjunto.'; }
        }
        const distance = fitDistance * zoom;
        camera.position.set(distance * Math.sin(yaw) * Math.cos(pitch), 1.07 + distance * Math.sin(pitch), distance * Math.cos(yaw) * Math.cos(pitch));
        camera.lookAt(0, 1.07, -.05);
        renderer.render(scene, camera);
        if (playing) requestRender();
      }

      function resize() {
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        fitDistance = Math.max(2.9 / (2 * halfFov), 2.2 / (2 * halfFov * camera.aspect));
        renderer.setSize(width, height, false);
        requestRender();
      }

      viewer.querySelectorAll('[data-burdeos3d-part]').forEach(input => input.addEventListener('change', () => { stopAnimation(); applyModel(); }));
      opening.addEventListener('input', () => { stopAnimation(); separation.value = '0'; applyModel(); });
      separation.addEventListener('input', () => { stopAnimation(); opening.value = '0'; applyModel(); });
      viewer.querySelectorAll('[data-burdeos3d-turn]').forEach(button => button.addEventListener('click', () => {
        yaw += Number(button.dataset.burdeos3dTurn) * Math.PI / 6;
        requestRender();
      }));
      viewer.querySelectorAll('[data-burdeos3d-zoom]').forEach(button => button.addEventListener('click', () => {
        zoom = THREE.MathUtils.clamp(zoom + Number(button.dataset.burdeos3dZoom) * .12, .65, 1.65);
        requestRender();
      }));
      function resetView() {
        yaw = Math.PI - .32;
        pitch = .13;
        zoom = 1;
        requestRender();
      }
      viewer.querySelector('[data-burdeos3d-reset]').addEventListener('click', () => {
        stopAnimation();
        opening.value = separation.value = '0';
        leafVisible.checked = frameVisible.checked = preVisible.checked = true;
        applyModel();
        resetView();
        status.textContent = 'Vista restablecida. Se conservan los acabados elegidos.';
      });
      assembly.addEventListener('click', () => {
        if (playing) { stopAnimation(); status.textContent = 'Secuencia pausada.'; return; }
        leafVisible.checked = frameVisible.checked = preVisible.checked = true;
        opening.value = '0';
        separation.value = '100';
        animationStart = 0;
        playing = true;
        assembly.textContent = 'Pausar secuencia';
        assembly.setAttribute('aria-pressed', 'true');
        status.textContent = 'Mostrando una secuencia ilustrativa de ensamble y apertura.';
        applyModel();
        if (!inView) stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      canvas.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
        canvas.classList.add('is-dragging');
      });
      canvas.addEventListener('pointermove', event => {
        if (!pointer || pointer.id !== event.pointerId) return;
        yaw -= (event.clientX - pointer.x) * .008;
        if (event.pointerType === 'mouse') pitch = THREE.MathUtils.clamp(pitch + (event.clientY - pointer.y) * .005, -.15, .6);
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        requestRender();
      });
      const release = () => { pointer = null; canvas.classList.remove('is-dragging'); };
      canvas.addEventListener('pointerup', release);
      canvas.addEventListener('pointercancel', release);
      canvas.addEventListener('lostpointercapture', release);
      canvas.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'ArrowLeft') yaw -= .15;
        if (event.key === 'ArrowRight') yaw += .15;
        if (event.key === 'ArrowUp') pitch = Math.min(.6, pitch + .06);
        if (event.key === 'ArrowDown') pitch = Math.max(-.15, pitch - .06);
        if (event.key === '+' || event.key === '=') zoom = Math.max(.65, zoom - .12);
        if (event.key === '-') zoom = Math.min(1.65, zoom + .12);
        if (event.key === 'Home') resetView();
        requestRender();
      });
      draw = requestRender;
      updateModel();
      originalMaterials.forEach(material => material.dispose());
      resize();
      new ResizeObserver(resize).observe(stage);
      viewer.dataset.state = 'ready';
      fieldset.disabled = false;
      start.hidden = true;
      status.textContent = 'Vista 3D lista. Arrastrá horizontalmente para girar.';
    } catch (error) {
      if (scene) scene.traverse(object => { if (object.isMesh) { object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach(material => material.dispose()); else object.material.dispose(); } });
      renderer?.dispose();
      renderer?.domElement.remove();
      viewer.dataset.state = 'error';
      status.textContent = 'No se pudo activar el 3D. La vista renderizada sigue disponible; podés volver a intentar.';
      start.textContent = 'Volver a intentar';
      start.disabled = false;
    }
    loading = false;
  }

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (!inView) stopAnimation();
    else draw?.();
  }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAnimation();
    else draw?.();
  });
  const nearby = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    nearby.disconnect();
    initialize();
  }, { rootMargin: '250px' });
  nearby.observe(viewer);
  start.addEventListener('click', initialize);
})();
