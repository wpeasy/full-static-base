// Page logic for the single template page item.html. status: loading | ready | missing | error.
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
      const path = ItemData.pageUrl(item.slug);
      const title = item.seoTitle || `${item.name} | ${item.role} in ${item.place} | ${site.name}`;
      const description = item.seoDescription || `${item.summary} ${site.collection.cta}`;
      Seo.setSeo({
        site, title, description, path, type: 'profile',
        graph: [
          builders.organisation(site),
          builders.website(site),
          builders.webPage({ type: 'ProfilePage', path, name: title, description, mainEntity: `${Seo.abs(path)}#person` }),
          builders.person({ path, name: item.name, jobTitle: item.role, description: item.summary, place: item.place }),
          builders.breadcrumb(path, [
            { name: 'Home', path: '/' },
            { name: site.collection.name, path: site.collection.path },
            { name: item.name, path },
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
