// SEO helpers: set <title>, meta, canonical and JSON-LD from data, plus reusable schema builders.
// Plain script, no Alpine. Exposes window.Seo. Load before the scripts that call it.
//   Seo.setSeo({ site, title, description, url, type: 'profile', graph: [...], noindex: false })
// `url` is the page's full absolute URL: build it with Seo.siteUrl('item/sam-rivera').
// JSON-LD is a data block (type="application/ld+json"): it is never executed, so it is CSP-safe.
// Absolute URLs are location.origin + the site base path, which is derived from this script's own URL
// (<base>/js/seo.js), so the code is right on localhost, on a domain root and under /repo-name/ (GitHub Pages).
// Keep the static tags in each HTML file as the fallback for no-JS visitors and link-preview scrapers.

(() => {
  const LIMITS = { title: 60, description: 160 };
  const base = new URL('../', document.currentScript.src).pathname; // '/' or '/repo-name/'
  const origin = () => location.origin;
  const siteRoot = () => origin() + base;
  const abs = (path) => new URL(String(path).replace(/^\//, ''), siteRoot()).href; // site-relative path or full URL -> full URL
  const siteUrl = abs;
  const head = document.head;

  function setMeta(attr, key, content) {
    let el = head.querySelector(`meta[${attr}="${key}"]`);
    if (content === null || content === undefined || content === '') { el?.remove(); return; }
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); head.append(el); }
    el.setAttribute('content', content);
  }

  function setLink(rel, href) {
    let el = head.querySelector(`link[rel="${rel}"]`);
    if (!href) { el?.remove(); return; }
    if (!el) { el = document.createElement('link'); el.rel = rel; head.append(el); }
    el.href = href;
  }

  function setJsonLd(graph, id = 'jsonld') {
    let el = document.getElementById(id);
    if (!graph || !graph.length) { el?.remove(); return; }
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; head.append(el); }
    el.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }

  function warnLength(kind, text) {
    if (text.length > LIMITS[kind]) console.warn(`SEO: ${kind} is ${text.length} characters (aim for ${LIMITS[kind]} or fewer): ${text}`);
  }

  function setSeo({ site = {}, title, description, url = location.origin + location.pathname, type = 'website', graph, noindex = false }) {
    warnLength('title', title);
    warnLength('description', description);
    document.title = title;
    setMeta('name', 'description', description);
    setLink('canonical', noindex ? '' : url);
    setMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setMeta('name', 'theme-color', site.themeColor);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', site.name);
    setMeta('property', 'og:locale', site.locale);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', noindex ? '' : url);
    if (site.shareImage) {
      setMeta('property', 'og:image', abs(site.shareImage));
      setMeta('property', 'og:image:width', site.shareImageWidth && String(site.shareImageWidth));
      setMeta('property', 'og:image:height', site.shareImageHeight && String(site.shareImageHeight));
      setMeta('property', 'og:image:alt', site.shareImageAlt);
      setMeta('name', 'twitter:image', abs(site.shareImage));
    }
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setJsonLd(noindex ? null : graph);
  }

  // ---- Schema builders: return nodes with stable @ids so pages reference rather than duplicate ----
  const ids = {
    organisation: () => `${siteRoot()}#organization`,
    website: () => `${siteRoot()}#website`,
  };

  // Only properties present in the data are emitted. Never invent facts.
  function organisation(site) {
    const o = site.organisation || {};
    const node = { '@type': o.type || 'Organization', '@id': ids.organisation(), name: o.name || site.name, url: siteRoot() };
    if (o.description) node.description = o.description;
    if (o.logo) node.logo = abs(o.logo);
    if (o.sameAs?.length) node.sameAs = o.sameAs;
    if (o.telephone) node.telephone = o.telephone;
    if (o.email) node.email = o.email;
    if (o.address) node.address = { '@type': 'PostalAddress', ...o.address };
    if (o.openingHours?.length) node.openingHours = o.openingHours;
    if (site.offers?.length) node.hasOfferCatalog = offerCatalog(site.offers, 'Plans');
    return node;
  }

  function offerCatalog(offers, name) {
    return {
      '@type': 'OfferCatalog',
      name,
      itemListElement: offers.map((offer) => ({
        '@type': 'Offer',
        name: offer.name,
        priceSpecification: { '@type': 'UnitPriceSpecification', price: offer.price, priceCurrency: offer.currency, ...(offer.unit && { unitCode: offer.unit }) },
      })),
    };
  }

  function website(site) {
    return { '@type': 'WebSite', '@id': ids.website(), url: siteRoot(), name: site.name, inLanguage: site.language, publisher: { '@id': ids.organisation() } };
  }

  function webPage({ type = 'WebPage', url, name, description, mainEntity }) {
    const node = { '@type': type, '@id': `${url}#webpage`, url, name, description, isPartOf: { '@id': ids.website() } };
    if (mainEntity) node.mainEntity = { '@id': mainEntity };
    return node;
  }

  function person({ url, name, jobTitle, description, image, place }) {
    const node = { '@type': 'Person', '@id': `${url}#person`, name, url, worksFor: { '@id': ids.organisation() } };
    if (jobTitle) node.jobTitle = jobTitle;
    if (description) node.description = description;
    if (image) node.image = abs(image);
    if (place) node.workLocation = { '@type': 'Place', name: place };
    return node;
  }

  function breadcrumb(url, trail) {
    return {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, name: step.name, item: step.url })),
    };
  }

  function itemList({ url, name, items }) {
    return {
      '@type': 'ItemList',
      '@id': `${url}#itemlist`,
      name,
      itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: item.url })),
    };
  }

  window.Seo = { base, setMeta, setLink, setJsonLd, setSeo, abs, siteUrl, builders: { organisation, offerCatalog, website, webPage, person, breadcrumb, itemList } };
})();
