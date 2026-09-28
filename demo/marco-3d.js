(() => {
  const viewer = document.querySelector('[data-frame-3d]');
  const stage = viewer.querySelector('.frame3d-stage');
  const start = viewer.querySelector('[data-3d-start]');
  const controls = viewer.querySelector('fieldset');
  const status = viewer.querySelector('[data-3d-status]');
  let loading = false;

  async function initialize() {
    if (loading || viewer.dataset.state === 'ready') return;
    loading = true;
    start.disabled = true;
    status.textContent = 'Preparando la vista 3D…';
    let renderer;

    try {
      const [THREE, { crearModeloPuerta }] = await Promise.all([
        import('./assets/vendor/three/three.module.min.js'),
        import('./marco-3d-modelo.js?v=20260927-marco-3d-1')
      ]);
      const texture = await new THREE.TextureLoader().loadAsync('assets/img/enchapada-nogal-rayado-grande.webp');
      texture.colorSpace = THREE.SRGBColorSpace;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 30);
      const { grupo, hoja, pared } = crearModeloPuerta(THREE, texture);
      scene.add(grupo, new THREE.HemisphereLight(0xffffff, 0xa69178, 2));
      const key = new THREE.DirectionalLight(0xfff8eb, 3);
      key.position.set(3, 6, 5);
      key.castShadow = true;
      key.shadow.mapSize.set(2048, 2048);
      Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: .1, far: 14 });
      key.shadow.camera.updateProjectionMatrix();
      key.shadow.normalBias = .012;
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 1.6);
      fill.position.set(-4, 2, -3);
      scene.add(fill);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ color: 0x493d2b, opacity: .18 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -.005;
      ground.receiveShadow = true;
      scene.add(ground);

      const canvas = renderer.domElement;
      canvas.tabIndex = 0;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Modelo 3D de prueba: puerta Placa con marco y contramarco');
      canvas.setAttribute('aria-describedby', 'marco-3d-ayuda');
      stage.append(canvas);
      let yaw = .42;
      let pitch = .12;
      let distance = 4.6;
      let scheduled = false;
      let pointer;

      function render() {
        scheduled = false;
        camera.position.set(distance * Math.sin(yaw) * Math.cos(pitch), 1.14 + distance * Math.sin(pitch), distance * Math.cos(yaw) * Math.cos(pitch));
        camera.lookAt(0, 1.14, 0);
        renderer.render(scene, camera);
      }

      function requestRender() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(render);
      }

      function resize() {
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        distance = Math.max(2.9 / (2 * halfFov), 2 / (2 * halfFov * camera.aspect));
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        requestRender();
      }

      const opening = viewer.querySelector('[data-3d-opening]');
      const openingValue = viewer.querySelector('output');
      const wall = viewer.querySelector('[data-3d-wall]');
      opening.addEventListener('input', () => {
        hoja.rotation.y = -THREE.MathUtils.degToRad(Number(opening.value));
        openingValue.value = `${opening.value}°`;
        requestRender();
      });
      wall.addEventListener('change', () => {
        pared.visible = wall.checked;
        requestRender();
      });
      viewer.querySelectorAll('[data-3d-turn]').forEach(button => button.addEventListener('click', () => {
        yaw += Number(button.dataset['3dTurn']) * Math.PI / 6;
        requestRender();
      }));
      viewer.querySelector('[data-3d-reset]').addEventListener('click', () => {
        yaw = .42;
        pitch = .12;
        hoja.rotation.y = 0;
        opening.value = '0';
        openingValue.value = '0°';
        pared.visible = true;
        wall.checked = true;
        requestRender();
      });
      canvas.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0) return;
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
        canvas.setPointerCapture(event.pointerId);
        canvas.classList.add('is-dragging');
      });
      canvas.addEventListener('pointermove', event => {
        if (!pointer || event.pointerId !== pointer.id) return;
        yaw -= (event.clientX - pointer.x) * .008;
        if (event.pointerType === 'mouse') pitch = THREE.MathUtils.clamp(pitch + (event.clientY - pointer.y) * .005, -.1, .55);
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        requestRender();
      });
      function releasePointer() {
        pointer = null;
        canvas.classList.remove('is-dragging');
      }
      canvas.addEventListener('pointerup', releasePointer);
      canvas.addEventListener('pointercancel', releasePointer);
      canvas.addEventListener('lostpointercapture', releasePointer);
      canvas.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'ArrowLeft') yaw -= .15;
        if (event.key === 'ArrowRight') yaw += .15;
        if (event.key === 'ArrowUp') pitch = Math.min(.55, pitch + .06);
        if (event.key === 'ArrowDown') pitch = Math.max(-.1, pitch - .06);
        if (event.key === 'Home') { yaw = .42; pitch = .12; }
        requestRender();
      });

      resize();
      render();
      new ResizeObserver(resize).observe(stage);
      viewer.dataset.state = 'ready';
      controls.disabled = false;
      start.hidden = true;
      status.textContent = 'Vista 3D lista. Arrastrá para girar.';
    } catch {
      renderer?.dispose();
      renderer?.domElement.remove();
      status.textContent = 'No se pudo activar el 3D en este navegador. Podés volver a intentar; la imagen de referencia sigue disponible.';
      start.textContent = 'Volver a intentar';
      start.disabled = false;
    }
    loading = false;
  }

  start.addEventListener('click', initialize);
  const nearby = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    nearby.disconnect();
    initialize();
  }, { rootMargin: '250px' });
  nearby.observe(viewer);
})();
