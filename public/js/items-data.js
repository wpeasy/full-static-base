// Loader for the `items` collection (data/items.json). Copy and rename for a new collection
// (e.g. js/coaches-data.js, window.CoachData, SINGULAR = 'coach'). See docs/data-driven-pages.md.
// Exposes window.ItemData = { load, slugify, pageUrl, slugFromLocation }.

(() => {
  const JSON_URL = new URL('../data/items.json', document.currentScript.src).href; // relative to this script
  const SINGULAR = 'item'; // pages live at /item/<slug>

  // NFKD, strip accents, lowercase, non-alphanumerics to hyphens. Keep identical to tools/build-sitemap.mjs.
  const slugify = (text) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  let promise; // the JSON is fetched once and shared
  const load = () => {
    promise ??= fetch(JSON_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${JSON_URL} (${response.status})`);
        return response.json();
      })
      .then((data) => ({ ...data, items: data.items.map((item) => ({ ...item, slug: item.slug || slugify(item.name) })) }))
      .catch((error) => { promise = undefined; throw error; });
    return promise;
  };

  const pageUrl = (slug) => `/${SINGULAR}/${slug}`;

  // /item/<slug>, /item/<slug>/ or item.html?slug=<slug>
  const slugFromLocation = () => {
    const match = location.pathname.match(new RegExp(`/${SINGULAR}/([^/]+)/?$`));
    return match ? decodeURIComponent(match[1]) : new URLSearchParams(location.search).get('slug') || '';
  };

  window.ItemData = { load, slugify, pageUrl, slugFromLocation };
})();
