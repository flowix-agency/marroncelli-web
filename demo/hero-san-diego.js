const hero = document.querySelector('.hero');
const imageArea = document.querySelector('.hero-image');
const scene = document.querySelector('.scene');
const intensity = document.querySelector('#intensidad');
const intensityValue = document.querySelector('#intensity-value');
const modeButtons = document.querySelectorAll('.modes button');
const photoOnly = document.querySelector('.photo-only');
const motionToggle = document.querySelector('.motion-toggle');
const motionState = document.querySelector('#motion-state');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let motionEnabled = true;
let baseAmount = Number(intensity.value) / 100;
let currentAmount = Math.min(1, baseAmount * 3.2);
let proximity = 0;
let phase = 0;
let frame = 0;
let lastFrame = 0;
let lastPointerMove = -Infinity;
let inView = true;
let entranceElapsed = 0;
let photoReady = false;
const entranceDuration = 3600;

function animate(time) {
  const elapsed = lastFrame ? Math.min(time - lastFrame, 64) : 0;
  lastFrame = time;
  const interacting = time - lastPointerMove < 1500;
  entranceElapsed = Math.min(entranceDuration, entranceElapsed + elapsed);
  const entering = entranceElapsed < entranceDuration;
  const entranceFocus = entering ? (1 + Math.cos(entranceElapsed / entranceDuration * Math.PI)) / 2 : 0;
  if (!interacting && !entering) phase = (phase + elapsed / 9000 * Math.PI * 2) % (Math.PI * 2);
  const target = Math.min(1, baseAmount * (1 + .18 * Math.sin(phase) + 2.2 * Math.max(proximity, entranceFocus)));
  currentAmount += (target - currentAmount) * (1 - Math.exp(-elapsed / 280));
  hero.style.setProperty('--ambient-light', (1 - currentAmount * .65).toFixed(4));
  const state = interacting ? 'Respuesta al cursor' : entering ? 'Entrada del hero' : 'Ciclo de 9 s';
  if (motionState.textContent !== state) motionState.textContent = state;
  frame = requestAnimationFrame(animate);
}

function syncMotion() {
  cancelAnimationFrame(frame);
  lastFrame = 0;
  const natural = hero.dataset.mode === 'natural';
  const running = motionEnabled && photoReady && !natural && !document.hidden && inView && baseAmount > 0;
  hero.classList.toggle('is-animated', running);
  motionToggle.disabled = natural;
  motionToggle.textContent = motionEnabled ? 'Pausar movimiento' : 'Activar movimiento';
  motionState.textContent = natural ? 'Foto natural' : !motionEnabled ? 'Pausado' : baseAmount === 0 ? 'Sin atenuación' : 'Ciclo de 9 s';
  if (running) {
    frame = requestAnimationFrame(animate);
  } else if (natural || baseAmount === 0) {
    currentAmount = baseAmount;
    hero.style.setProperty('--ambient-light', 1 - currentAmount * .65);
  }
}

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    hero.dataset.mode = button.dataset.mode;
    for (const other of modeButtons) {
      other.setAttribute('aria-pressed', String(other === button));
    }
    intensity.disabled = button.dataset.mode === 'natural';
    proximity = 0;
    lastPointerMove = -Infinity;
    syncMotion();
  });
}

intensity.addEventListener('input', () => {
  baseAmount = Number(intensity.value) / 100;
  currentAmount = baseAmount;
  hero.style.setProperty('--ambient-light', 1 - baseAmount * .65);
  hero.style.setProperty('--ambient-blur', `${baseAmount * 1.8}px`);
  hero.style.setProperty('--ambient-saturation', 1 - baseAmount * .1);
  intensityValue.value = `${intensity.value}%`;
  syncMotion();
});

motionToggle.addEventListener('click', () => {
  motionEnabled = !motionEnabled;
  proximity = 0;
  lastPointerMove = -Infinity;
  syncMotion();
});

hero.addEventListener('pointermove', (event) => {
  if (!motionEnabled || !finePointer.matches || event.pointerType !== 'mouse' || hero.dataset.mode === 'natural' || baseAmount === 0) return;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(scene.getScreenCTM().inverse());
  const distance = Math.hypot(Math.max(294 - point.x, 0, point.x - 638), Math.max(330 - point.y, 0, point.y - 854));
  const closeness = Math.max(0, 1 - distance / 300);
  proximity = closeness * closeness * (3 - 2 * closeness);
  lastPointerMove = performance.now();
});

hero.addEventListener('pointerleave', () => { proximity = 0; });
document.addEventListener('visibilitychange', syncMotion);
finePointer.addEventListener('change', () => { proximity = 0; });
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  syncMotion();
}).observe(hero);

photoOnly.addEventListener('click', () => {
  const active = hero.classList.toggle('is-photo-only');
  photoOnly.setAttribute('aria-pressed', String(active));
  photoOnly.textContent = active ? 'Mostrar texto' : 'Ver solo la foto';
});

new ResizeObserver(([entry]) => {
  proximity = 0;
  const { width, height } = entry.contentRect;
  const mobile = window.matchMedia('(max-width: 900px)').matches;
  const sourceHeight = 700;
  const sourceWidth = Math.min(1600, sourceHeight * width / height);
  const sourceTop = 235;
  const center = mobile ? 465 : 805;
  const sourceLeft = Math.min(1600 - sourceWidth, Math.max(0, center - sourceWidth / 2));
  scene.setAttribute('viewBox', `${sourceLeft} ${sourceTop} ${sourceWidth} ${sourceHeight}`);
  hero.style.setProperty('--copy-left', `${(710 - sourceLeft) / sourceWidth * 100}%`);
  hero.style.setProperty('--copy-top', `${(548 - sourceTop) / sourceHeight * 100}%`);
  hero.style.setProperty('--copy-width', `${470 / sourceWidth * 100}%`);
}).observe(imageArea);

const entrancePhoto = new Image();
entrancePhoto.addEventListener('load', () => {
  photoReady = true;
  syncMotion();
}, {once: true});
entrancePhoto.src = document.querySelector('.scene-background').getAttribute('href');

syncMotion();
