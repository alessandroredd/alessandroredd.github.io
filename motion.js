// Movimento condiviso, senza dipendenze. Rotella e gesti touch rimangono nativi.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(.215,.61,.355,1)';
  let scrollFrame = 0;
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -24px 0px' }) : null;
  const cancelScroll = () => { cancelAnimationFrame(scrollFrame); scrollFrame = 0; };
  ['wheel', 'touchstart', 'pointerdown'].forEach(name => window.addEventListener(name, cancelScroll, { passive: true }));
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) cancelScroll();
  });
  preference.addEventListener('change', () => {
    cancelScroll();
    if (preference.matches) {
      document.querySelectorAll('.motion-reveal').forEach(el => el.classList.add('is-revealed'));
      document.getAnimations().forEach(animation => animation.cancel());
    }
  });
  function reveal(element, delay = 0) {
    element.classList.add('motion-reveal');
    element.style.setProperty('--reveal-delay', `${delay}ms`);
    if (preference.matches || !observer) element.classList.add('is-revealed');
    else observer.observe(element);
  }
  function enter(element, distance = 14, duration = 420) {
    if (preference.matches || !element.animate) return;
    element.getAnimations().forEach(animation => animation.cancel());
    element.animate([{ opacity: 0, transform: `translateY(${distance}px)` }, { opacity: 1, transform: 'translateY(0)' }], { duration, easing });
  }
  function scrollTo(target, instant = false) {
    cancelScroll();
    const margin = typeof target === 'number' ? 0 : parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const position = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY - margin;
    const end = Math.max(0, Math.min(position, document.documentElement.scrollHeight - innerHeight));
    const start = window.scrollY;
    if (preference.matches || instant || Math.abs(end - start) < 2) { window.scrollTo({ top: end, behavior: 'instant' }); return; }
    const duration = Math.min(1050, Math.max(500, Math.abs(end - start) * .32 + 420));
    const began = performance.now();
    const step = now => {
      const progress = Math.min((now - began) / duration, 1);
      const smooth = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo({ top: start + (end - start) * smooth, behavior: 'instant' });
      if (progress < 1) scrollFrame = requestAnimationFrame(step);
      else scrollFrame = 0;
    };
    scrollFrame = requestAnimationFrame(step);
  }
  const closing = new WeakMap();
  const openDialog = dialog => {
    if (dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add('dialog-open');
    const drawer = dialog.classList.contains('mobile-menu');
    if (!preference.matches) dialog.animate(drawer ? [{ transform: 'translateX(-100%)', opacity: 1 }, { transform: 'translateX(0)', opacity: 1 }] : [{ transform: 'translateY(-16px) scale(.96)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }], { duration: drawer ? 350 : 300, easing });
  };
  const closeDialog = dialog => {
    if (!dialog.open) return Promise.resolve();
    if (closing.has(dialog)) return closing.get(dialog);
    const done = (async () => {
      if (!preference.matches) {
        const drawer = dialog.classList.contains('mobile-menu');
        const animation = dialog.animate(drawer ? [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-100%)', opacity: 1 }] : [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(-10px) scale(.98)', opacity: 0 }], { duration: 220, easing });
        await animation.finished.catch(() => {});
      }
      dialog.close();
      closing.delete(dialog);
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('dialog-open');
    })();
    closing.set(dialog, done);
    return done;
  };
  function initDialog(dialog) {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.querySelector('.dialog-close').addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('dialog-open');
    });
  }
  document.addEventListener('focusin', event => {
    const pending = event.target.closest('.motion-reveal');
    if (pending) { pending.classList.add('is-revealed'); observer?.unobserve(pending); }
  });
  document.documentElement.classList.add('motion-ready');
  window.portfolioMotion = { reveal, enter, scrollTo, openDialog, closeDialog, initDialog, reduced: () => preference.matches };
})();
