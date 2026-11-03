// Page logic for the single template page item.html. status: loading | ready | missing | error.
// Only `loading` sets aria-busy on <main class="page">; every other value clears it (docs/js-rendered-pages.md).
// SEO comes from the same JSON as the content (js/seo.js). Needs js/seo.js and js/items-data.js first.

document.addEventListener('alpine:init', () => {
  Alpine.data('itemProfile', () => ({
    status: 'loading',
    site: {},
    topics: {},
    // Empty-shaped so bindings work before the data arrives
    item: { name: '', role: '', place: '', summary: '', bio: [], tags: [] },

    get heading() {
      return { loading: 'Loading…', ready: this.item.name }[this.status] || 'Not found';
    },
    get initials() {
      return this.item.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
    },
    get tagList() {
      return this.item.tags.map((id) => ({ id, label: this.topics[id] || id }));
    },
    get message() {
      return this.status === 'error'
        ? 'Sorry, this page could not be loaded. Please try again later.'
        : 'We could not find that page. It may have moved, or the link is wrong.';
    },

    async init() {
      try {
        const data = await ItemData.load();
        this.site = data.site;
        this.topics = data.topics;
        const found = data.items.find((item) => item.slug === ItemData.slugFromLocation());
        if (!found) { this.status = 'missing'; this.seoUnavailable(); return; }
        this.item = found;
        this.status = 'ready';
        this.seoReady();
      } catch (error) {
        console.error(error);
        this.status = 'error';
        this.seoUnavailable();
      }
    },

    seoReady() {
      const { site, item } = this;
      const { builders } = Seo;
      const url = ItemData.url(`item/${item.slug}`);
      const title = item.seoTitle || `${item.name} | ${item.role} in ${item.place} | ${site.name}`;
      const description = item.seoDescription || `${item.summary} ${site.collection.cta}`;
      Seo.setSeo({
        site, title, description, url, type: 'profile',
        graph: [
          builders.organisation(site),
          builders.website(site),
          builders.webPage({ type: 'ProfilePage', url, name: title, description, mainEntity: `${url}#person` }),
          builders.person({ url, name: item.name, jobTitle: item.role, description: item.summary, place: item.place }),
          builders.breadcrumb(url, [
            { name: 'Home', url: ItemData.url() },
            { name: site.collection.name, url: ItemData.url(site.collection.path) },
            { name: item.name, url },
          ]),
        ],
      });
    },

    // Unknown slug or load failure: tell crawlers not to index. The host still answers 200 (soft 404).
    seoUnavailable() {
      const name = this.site.name || document.title;
      Seo.setSeo({ site: this.site, title: `Not found | ${name}`, description: 'This page could not be found.', noindex: true });
    },
  }));
});
