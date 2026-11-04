// Scroll effects with GSAP + ScrollTrigger (vendored in js/vendor/, docs/vendor.md). Plain script, no Alpine.
//  1. Elements with data-reveal fade in and rise a little (a timed tween, not scrubbed) when their top edge is ~80px
//     inside the bottom of the viewport. They reset when they leave, so the effect replays whenever they come back.
//  2. [data-ken-burns] (e.g. a hero) zooms very slowly via the --hero-zoom CSS variable, restarting each time it
//     returns to view. The consumer CSS applies it: transform: scale(var(--hero-zoom, 1)).
// Robust to Back/forward and reload: the browser restores the scroll position before layout is final, so on every
// ScrollTrigger refresh each trigger re-applies the state matching the CURRENT scroll position (onRefresh) instead of
// relying on enter/leave events fired against stale measurements. Layout changes (Alpine un-hiding a grid) and bfcache
// restores call Reveal.refresh().
// base.css sets html { scroll-behavior: smooth }; ScrollTrigger measures by jumping to the top of the page, and a smooth
// jump gives wrong measurements, so this script turns it off while it runs and glides in-page anchors itself.
// Only runs under prefers-reduced-motion: no-preference; otherwise content just appears and nothing moves.
// Without JavaScript nothing is hidden.
// Load order: gsap.min.js, ScrollTrigger.min.js, reveal.js, then Alpine.

(() => {
  const OFFSET = 80;      // px inside the viewport bottom where the reveal starts
  const RISE = 24;        // px the element travels up
  const DURATION = 0.6;   // seconds
  const ZOOM_TO = 1.25;   // Ken Burns end scale
  const ZOOM_SECONDS = 24;

  window.Reveal = { scan() {}, refresh() {} };
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const seen = new WeakSet();

    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href*="#"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const url = new URL(link.href);
      const page = (path) => path.replace(/index\.html$/, ''); // /index.html and / are the same page
      const target = url.hash.length > 1 && page(url.pathname) === page(location.pathname) ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      history.pushState(null, '', url.hash);
    };
    document.addEventListener('click', onAnchorClick);

    const scan = () => {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const tween = gsap.fromTo(el, { opacity: 0, y: RISE }, { opacity: 1, y: 0, duration: DURATION, ease: 'power2.out', paused: true, immediateRender: true });
        const play = () => tween.play();
        const reset = () => tween.pause(0);
        ScrollTrigger.create({
          trigger: el,
          start: `top bottom-=${OFFSET}`,
          end: 'bottom top',
          onEnter: play,
          onEnterBack: play,
          onLeave: reset,
          onLeaveBack: reset,
          // After any (re)measure, match the current scroll position.
          onRefresh: (self) => { if (self.isActive) { if (tween.progress() === 0) tween.play(); } else tween.pause(0); },
        });
      });
    };

    const hero = document.querySelector('[data-ken-burns]');
    if (hero) {
      const zoom = gsap.fromTo(hero, { '--hero-zoom': 1 }, { '--hero-zoom': ZOOM_TO, duration: ZOOM_SECONDS, ease: 'none', paused: true });
      ScrollTrigger.create({
        trigger: hero,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => zoom.restart(),
        onEnterBack: () => zoom.restart(),
        onLeave: () => zoom.pause(),
        onLeaveBack: () => zoom.pause(),
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('pageshow', (event) => { if (event.persisted) refresh(); });
    scan();
    window.Reveal = { scan, refresh };

    return () => { root.style.scrollBehavior = ''; document.removeEventListener('click', onAnchorClick); };
  });
})();
