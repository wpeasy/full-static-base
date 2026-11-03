// Loader for the `items` collection (data/items.json). Copy and rename for a new collection
// (e.g. js/coaches-data.js, window.CoachData, SINGULAR = 'coach'). See docs/data-driven-pages.md.
// Exposes window.ItemData = { base, load, slugify, href, url, slugFromLocation }.
// Preload the JSON in the <head> of every page that uses it:
//   <link rel="preload" href="/data/items.json" as="fetch" crossorigin="anonymous">

(() => {
  // Site base path from this script's own URL (<base>/js/items-data.js): '/' at a domain root,
  // '/repo-name/' on a GitHub Pages project site. Never hard-code '/'.
  const base = new URL('../', document.currentScript.src).pathname;
  const JSON_URL = `${base}data/items.json`;
  const SINGULAR = 'item'; // pages live at <base>item/<slug>
  const CACHE_KEY = `data:${JSON_URL}`;

  // NFKD, strip accents, lowercase, non-alphanumerics to hyphens. Keep identical to tools/build-sitemap.mjs.
  const slugify = (text) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const prepare = (data) => ({ ...data, items: data.items.map((item) => ({ ...item, slug: item.slug || slugify(item.name) })) });

  // Storage can throw (private mode, blocked, full): the site works without it.
  const readCache = () => { try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch { return null; } };
  const writeCache = (text) => { try { sessionStorage.setItem(CACHE_KEY, text); } catch { /* ignore */ } };

  const fetchFresh = () => fetch(JSON_URL).then((response) => {
    if (!response.ok) throw new Error(`Could not load ${JSON_URL} (${response.status})`);
    return response.text();
  }).then((text) => { const data = JSON.parse(text); writeCache(text); return data; });

  // Stale-while-revalidate: with a copy in sessionStorage, return it at once and refresh the copy in the
  // background for the next page. An edit can therefore show one page late within a browser session.
  let promise; // one load per page, shared
  const load = () => {
    if (!promise) {
      const cached = readCache();
      if (cached) {
        fetchFresh().catch((error) => console.warn(error));
        promise = Promise.resolve(prepare(cached));
      } else {
        promise = fetchFresh().then(prepare).catch((error) => { promise = undefined; throw error; });
      }
    }
    return promise;
  };

  const href = (slug) => `${base}${SINGULAR}/${slug}`; // for links: includes the base path
  const url = (path = '') => location.origin + base + String(path).replace(/^\//, ''); // full URL for canonical and schema

  // <base>item/<slug>, …/<slug>/ or item.html?slug=<slug>
  const slugFromLocation = () => {
    const match = location.pathname.match(new RegExp(`/${SINGULAR}/([^/]+)/?$`));
    return match ? decodeURIComponent(match[1]) : new URLSearchParams(location.search).get('slug') || '';
  };

  window.ItemData = { base, load, slugify, href, url, slugFromLocation };
})();
