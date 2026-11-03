// Alpine components for styleguide.html (the framework review page).
// Loaded before Alpine so the 'alpine:init' listener is registered in time.

document.addEventListener('alpine:init', () => {

  // Theme cycler (style guide only; sites use themeToggle in components.js): sets data-theme on <html> (light | dark | auto)
  Alpine.data('themeCycle', () => ({
    theme: 'light',
    cycle() {
      const order = ['light', 'dark', 'auto'];
      this.theme = order[(order.indexOf(this.theme) + 1) % order.length];
      document.documentElement.dataset.theme = this.theme;
    },
  }));

  // Colour ramps: renders swatches for one colour from its CSS variables
  Alpine.data('ramp', (name) => ({
    name,
    steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    alphas: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90],
  }));

  // Fluid scale readout: measures the resolved px of each token at the current viewport
  Alpine.data('scale', (kind, names) => ({
    rows: names.map((name) => ({ name, px: 0 })),
    init() {
      this.measure();
      window.addEventListener('resize', () => this.measure());
    },
    measure() {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;';
      document.body.append(probe);
      this.rows.forEach((row) => {
        if (kind === 'text') probe.style.fontSize = `var(--text-${row.name})`;
        else probe.style.width = `var(--${kind}-${row.name})`;
        row.px = kind === 'text'
          ? parseFloat(getComputedStyle(probe).fontSize)
          : probe.getBoundingClientRect().width;
      });
      probe.remove();
    },
  }));
});
