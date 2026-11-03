// Small motion helpers shared by pages. Plain script, no Alpine, no libraries. Exposes window.Motion.
//   Motion.reduced()                      true when the visitor asked for reduced motion
//   Motion.sweep(svg, { duration, delay }) reveal a decorative SVG line left to right (clip-path), see docs/motion.md
//   Motion.once(element, callback)         run callback once when the element is on screen (or already above it)
// With reduce: sweep() does nothing (the line is simply visible) and once() still calls back, so counters can
// jump to their final value. Durations come from the --duration-* tokens.

(() => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => query.matches;

  const tokenMs = (name, fallback) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const value = parseFloat(raw);
    if (Number.isNaN(value)) return fallback;
    return raw.endsWith('ms') ? value : value * 1000;
  };

  // Do not draw lines with stroke-dashoffset + pathLength when the path has vector-effect: non-scaling-stroke:
  // dash lengths are then measured in screen pixels and the draw pops. Reveal the whole <svg> with a clip instead.
  function sweep(svg, { duration = tokenMs('--duration-slow', 400), delay = 0 } = {}) {
    if (reduced() || !svg.animate) return Promise.resolve();
    const rtl = getComputedStyle(svg).direction === 'rtl';
    const hidden = rtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
    const animation = svg.animate([{ clipPath: hidden }, { clipPath: 'inset(0 0 0 0)' }], {
      duration, delay, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'backwards',
    });
    return animation.finished.catch(() => {});
  }

  // IntersectionObserver reports elements already on screen straight away, and elements the browser restored
  // above the viewport after a reload (bottom < 0), which a ScrollTrigger `once` would never fire for.
  function once(element, callback, options = { threshold: 0.2 }) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom >= 0) continue;
        observer.disconnect();
        callback(entry.target);
        return;
      }
    }, options);
    observer.observe(element);
    return () => observer.disconnect();
  }

  window.Motion = { reduced, sweep, once };
})();
