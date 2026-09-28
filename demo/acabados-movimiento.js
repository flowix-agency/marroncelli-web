(() => {
  const jobs = new WeakMap();

  window.FinishMotion = async (scope, images, commit, animate = true) => {
    const previous = jobs.get(scope);
    previous?.overlays.forEach(({ image, animation }) => { animation.cancel(); image.remove(); });
    previous?.incoming.forEach(animation => animation.cancel());
    const job = { overlays: [], incoming: [] };
    jobs.set(scope, job);
    const changed = images.filter(({ image, src, srcset = '' }) =>
      image.src !== new URL(src, document.baseURI).href || image.srcset !== srcset
    );
    if (!animate || !changed.length) {
      scope.removeAttribute('aria-busy');
      commit();
      return 'updated';
    }

    scope.setAttribute('aria-busy', 'true');
    try {
      await Promise.all(changed.map(async ({ image, src, srcset = '' }) => {
        const destination = new Image();
        destination.sizes = image.sizes;
        destination.srcset = srcset;
        destination.src = src;
        await destination.decode();
      }));
    } catch {
      if (jobs.get(scope) !== job) return 'superseded';
      scope.removeAttribute('aria-busy');
      return 'failed';
    }
    if (jobs.get(scope) !== job) return 'superseded';

    const overlays = changed.filter(({ image }) => image.complete && image.naturalWidth).map(({ image }) => {
      const parent = image.parentElement;
      if (getComputedStyle(parent).position === 'static') parent.classList.add('finish-motion-host');
      const copy = image.cloneNode(false);
      [...copy.attributes].filter(attribute => attribute.name === 'id' || attribute.name.startsWith('data-')).forEach(attribute => copy.removeAttribute(attribute.name));
      copy.alt = '';
      copy.setAttribute('aria-hidden', 'true');
      copy.classList.add('finish-motion-previous');
      Object.assign(copy.style, {
        left: `${image.offsetLeft}px`, top: `${image.offsetTop}px`,
        width: `${image.offsetWidth}px`, height: `${image.offsetHeight}px`,
        objectFit: getComputedStyle(image).objectFit, objectPosition: getComputedStyle(image).objectPosition,
        opacity: '1'
      });
      parent.append(copy);
      return copy;
    });
    commit();
    scope.removeAttribute('aria-busy');
    job.overlays = overlays.map(image => ({ image, animation: image.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-in-out', fill: 'forwards' }) }));
    job.incoming = changed.filter(({ image }) => getComputedStyle(image).mixBlendMode === 'multiply').map(({ image, nextImage }) =>
      (nextImage || image).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-in-out' })
    );
    Promise.allSettled([...job.overlays.map(({ animation }) => animation.finished), ...job.incoming.map(animation => animation.finished)]).then(() => {
      overlays.forEach(image => image.remove());
      if (jobs.get(scope) === job) { job.overlays = []; job.incoming = []; }
    });
    return 'updated';
  };
})();
