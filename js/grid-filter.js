// Filterable, searchable grid with optional GSAP Flip animation.
//   <section class="filter" x-data="gridFilter"> … see COMPONENTS.md (filter)
// All items live in the HTML, so the list works without JS. Needs Alpine; GSAP + Flip are optional
// (without them the grid just updates). Motion is skipped when prefers-reduced-motion: reduce.

document.addEventListener('alpine:init', () => {
  Alpine.data('gridFilter', () => ({
    query: '',
    tag: 'all',
    count: 0,
    total: 0,

    init() {
      this.total = this.count = this.items().length;
    },

    items() {
      return [...this.$refs.grid.children];
    },

    // Called from `:hidden="!matches($el, query, tag)"`. query and tag are arguments (not read
    // from `this` here) so Alpine tracks them as dependencies of that binding.
    matches(el, query, tag) {
      const tags = (el.dataset.tags || '').split(/\s+/);
      const text = (el.dataset.search || el.textContent).toLowerCase();
      const q = query.trim().toLowerCase();
      return (tag === 'all' || tags.includes(tag)) && (!q || text.includes(q));
    },

    get status() {
      return `${this.count} of ${this.total} shown`;
    },

    setQuery(value) {
      this.update(() => { this.query = value; });
    },

    setTag(tag) {
      this.update(() => { this.tag = tag; });
    },

    // Run a state change, animating the grid with Flip when allowed.
    update(change) {
      const grid = this.$refs.grid;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !window.gsap || !window.Flip) {
        change();
        this.$nextTick(() => this.recount());
        return;
      }

      const items = this.items();
      const style = getComputedStyle(document.documentElement);
      const duration = parseFloat(style.getPropertyValue('--duration-slow')) / 1000 || 0.4;
      const ease = 'power2.inOut';
      const fromHeight = grid.offsetHeight;

      Flip.killFlipsOf(items);
      gsap.killTweensOf(grid);
      const state = Flip.getState(items);
      change();

      this.$nextTick(() => {
        this.recount();
        const toHeight = grid.offsetHeight; // natural height with the new set of items

        Flip.from(state, {
          duration,
          ease,
          absolute: true, // keeps moving items out of each other's way
          onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration }),
          onLeave: (els) => gsap.to(els, { opacity: 0, duration }),
        });

        // absolute items leave the flow and collapse the grid: animate its height so content below glides
        gsap.set(grid, { height: fromHeight });
        gsap.to(grid, { height: toHeight, duration, ease, clearProps: 'height' });
      });
    },

    recount() {
      this.count = this.items().filter((el) => !el.hidden).length;
    },
  }));
});
