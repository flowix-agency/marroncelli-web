const presentation = document.querySelector('.presentation');
const storyTrack = document.querySelector('.story-track');
const storySticky = document.querySelector('.story-sticky');
const storyHeader = document.querySelector('.site-header');
const storyScenes = [...document.querySelectorAll('.story-scene')];
const chapterButtons = [...document.querySelectorAll('[data-chapter]')];
const storyCurrent = document.querySelector('#story-current');
const linearStory = window.matchMedia('(max-width: 900px), (max-height: 680px)');
let currentChapter = -1;
let storyFrame = 0;

function updateStory() {
  storyFrame = 0;
  if (linearStory.matches) return;
  const distance = storyTrack.offsetHeight - storySticky.offsetHeight;
  const progress = Math.max(0, Math.min(1, (storyHeader.offsetHeight - storyTrack.getBoundingClientRect().top) / distance));
  const chapter = Math.min(storyScenes.length - 1, Math.floor(progress * storyScenes.length));
  if (chapter === currentChapter) return;
  currentChapter = chapter;
  storyScenes.forEach((scene, index) => {
    const active = index === chapter;
    scene.classList.toggle('is-active', active);
    scene.classList.toggle('is-before', index === chapter - 1);
    scene.classList.toggle('is-after', index === chapter + 1);
    scene.setAttribute('aria-hidden', String(!active));
    scene.inert = !active;
  });
  chapterButtons.forEach((button, index) => {
    if (index === chapter) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  storyCurrent.textContent = String(chapter + 1).padStart(2, '0');
}

function configureStory() {
  currentChapter = -1;
  if (linearStory.matches) {
    storyScenes.forEach(scene => {
      scene.removeAttribute('aria-hidden');
      scene.inert = false;
    });
  } else {
    updateStory();
  }
}

chapterButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const start = window.scrollY + storyTrack.getBoundingClientRect().top - storyHeader.offsetHeight;
    const distance = storyTrack.offsetHeight - storySticky.offsetHeight;
    const position = index === 0 ? 0 : (index + .12) / storyScenes.length;
    window.scrollTo({top: start + distance * position, behavior: 'instant'});
  });
});

window.addEventListener('scroll', () => {
  if (!storyFrame) storyFrame = requestAnimationFrame(updateStory);
}, {passive: true});
window.addEventListener('resize', configureStory);
linearStory.addEventListener('change', configureStory);
presentation.classList.add('is-ready');
configureStory();
