// Alpine components shared by every page. Load before alpine.min.js (both defer).
// Native HTML covers modal (<dialog>), accordion (<details name>) and menus (popover):
// Alpine is only used where HTML has no built-in behaviour (nav toggle, tabs, toasts).

document.addEventListener('alpine:init', () => {

  // Motion preference. Use before ANY scripted movement (scrollTo, animations, autoplay).
  //   if (!$reducedMotion()) el.scrollIntoView({ behavior: 'smooth' })
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  Alpine.magic('reducedMotion', () => () => reducedMotionQuery.matches);

  // Site nav: collapses below 48em. Esc closes it and returns focus to the toggle.
  //   <header class="nav" x-data="nav" :class="{ 'nav--open': open }" @keydown.escape="close">
  Alpine.data('nav', () => ({
    open: false,
    toggle() { this.open = !this.open; },
    close() {
      if (!this.open) return;
      this.open = false;
      this.$refs.toggle?.focus();
    },
  }));

  // Tabs (ARIA tabs pattern): arrow keys / Home / End move between tabs, Tab enters the panel.
  //   <div class="tabs" x-data="tabs(['one','two'])">  tab id="tab-one"  panel id="panel-one"
  Alpine.data('tabs', (ids, initial = ids[0]) => ({
    ids,
    active: initial,
    select(id) { this.active = id; },
    onKeydown(event) {
      const index = this.ids.indexOf(this.active);
      const moves = {
        ArrowRight: (index + 1) % this.ids.length,
        ArrowLeft: (index - 1 + this.ids.length) % this.ids.length,
        Home: 0,
        End: this.ids.length - 1,
      };
      if (!(event.key in moves)) return;
      event.preventDefault();
      this.active = this.ids[moves[event.key]];
      this.$nextTick(() => document.getElementById(`tab-${this.active}`)?.focus());
    },
  }));

  // Toasts: announced via the polite live region. Manual dismiss (no timed removal by default).
  //   <div x-data="toasts"> <div class="toast-region" role="status" aria-live="polite"> <template x-for…
  Alpine.data('toasts', () => ({
    items: [],
    counter: 0,
    add(message, type = 'info') { this.items.push({ id: ++this.counter, message, type }); },
    remove(id) { this.items = this.items.filter((item) => item.id !== id); },
  }));

  // Theme toggle: remembers light/dark in localStorage (initial value set by js/theme-init.js).
  //   <button class="theme-toggle" type="button" x-data="themeToggle" @click="switchTheme" :aria-pressed="dark" aria-label="Dark mode">
  Alpine.data('themeToggle', () => ({
    dark: false,
    init() {
      this.dark = this.resolved() === 'dark';
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (document.documentElement.dataset.theme === 'auto') this.dark = this.resolved() === 'dark';
      });
    },
    resolved() {
      const theme = document.documentElement.dataset.theme;
      if (theme === 'light' || theme === 'dark') return theme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    switchTheme() {
      this.dark = !this.dark;
      const theme = this.dark ? 'dark' : 'light';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('theme', theme); } catch (error) { /* storage blocked: choice lasts for this page only */ }
    },
  }));
});
