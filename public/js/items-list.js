// List page logic (items.html): cards, topic chips and search all come from data/items.json.
// Extends the generic gridFilter (js/grid-filter.js) with data-field matching, so filtering never
// depends on textContent (which is empty when x-for first inserts an item). Load order: seo.js,
// items-data.js, grid-filter.js, items-list.js, then Alpine.

document.addEventListener('alpine:init', () => {
  Alpine.data('itemList', () => {
    const list = {
      status: 'loading', // loading | ready | error. Only `loading` sets aria-busy on <main class="page">
      site: {},
      items: [],
      topics: [],

      // Called from `:hidden="!matchesItem(item, query, tag)"`; query and tag are arguments so Alpine tracks them.
      matchesItem(item, query, tag) {
        const q = query.trim().toLowerCase();
        const labels = item.tags.map((id) => this.labelOf(id));
        const text = [item.name, item.role, item.place, item.summary, ...labels].join(' ').toLowerCase();
        return (tag === 'all' || item.tags.includes(tag)) && (!q || text.includes(q));
      },
      labelOf(id) {
        return this.topics.find((topic) => topic.id === id)?.label || id;
      },
      pageUrl: (slug) => ItemData.href(slug),

      async init() {
        try {
          const data = await ItemData.load();
          this.site = data.site;
          this.topics = Object.entries(data.topics).map(([id, label]) => ({ id, label }));
          this.items = data.items;
          this.total = this.count = data.items.length;
          this.status = 'ready';
          this.seo();
          // The grid was hidden while loading: let reveal.js pick up new [data-reveal] elements and re-measure every trigger.
          this.$nextTick(() => { window.Reveal?.scan(); window.Reveal?.refresh(); });
        } catch (error) {
          console.error(error);
          this.status = 'error';
        }
      },

      seo() {
        const { site, items } = this;
        const { builders } = Seo;
        const { name, description } = site.collection;
        const url = ItemData.url(site.collection.path);
        const title = `${name} | ${site.name}`;
        Seo.setSeo({
          site, title, description, url,
          graph: [
            builders.organisation(site),
            builders.website(site),
            builders.webPage({ url, name: title, description }),
            builders.itemList({ url, name, items: items.map((item) => ({ name: item.name, url: ItemData.url(`item/${item.slug}`) })) }),
            builders.breadcrumb(url, [{ name: 'Home', url: ItemData.url() }, { name, url }]),
          ],
        });
      },
    };
    // Keep the base's getters (status) intact: copy descriptors rather than spreading
    const component = GridFilter();
    return Object.defineProperties(component, Object.getOwnPropertyDescriptors(list));
  });
});
