// SEO helpers: set <title>, meta, canonical and JSON-LD from data, plus reusable schema builders.
// Plain script, no Alpine. Exposes window.Seo. Load before the scripts that call it.
//   Seo.setSeo({ site, title, description, path, type: 'profile', graph: [...], noindex: false })
// JSON-LD is a data block (type="application/ld+json"): it is never executed, so it is CSP-safe.
// Absolute URLs use location.origin, so the same code is right on localhost and on the live domain.
// Keep the static tags in each HTML file as the fallback for no-JS visitors and link-preview scrapers.

(() => {
  const LIMITS = { title: 60, description: 160 };
  const origin = () => location.origin;
  const abs = (path) => new URL(path, origin()).href;
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

  function setSeo({ site = {}, title, description, path = location.pathname, type = 'website', graph, noindex = false }) {
    warnLength('title', title);
    warnLength('description', description);
    const url = abs(path);
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
    organisation: () => `${origin()}/#organization`,
    website: () => `${origin()}/#website`,
  };

  // Only properties present in the data are emitted. Never invent facts.
  function organisation(site) {
    const o = site.organisation || {};
    const node = { '@type': o.type || 'Organization', '@id': ids.organisation(), name: o.name || site.name, url: `${origin()}/` };
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
    return { '@type': 'WebSite', '@id': ids.website(), url: `${origin()}/`, name: site.name, inLanguage: site.language, publisher: { '@id': ids.organisation() } };
  }

  function webPage({ type = 'WebPage', path, name, description, mainEntity }) {
    const url = abs(path);
    const node = { '@type': type, '@id': `${url}#webpage`, url, name, description, isPartOf: { '@id': ids.website() } };
    if (mainEntity) node.mainEntity = { '@id': mainEntity };
    return node;
  }

  function person({ path, name, jobTitle, description, image, place }) {
    const node = { '@type': 'Person', '@id': `${abs(path)}#person`, name, url: abs(path), worksFor: { '@id': ids.organisation() } };
    if (jobTitle) node.jobTitle = jobTitle;
    if (description) node.description = description;
    if (image) node.image = abs(image);
    if (place) node.workLocation = { '@type': 'Place', name: place };
    return node;
  }

  function breadcrumb(path, trail) {
    return {
      '@type': 'BreadcrumbList',
      '@id': `${abs(path)}#breadcrumb`,
      itemListElement: trail.map((step, i) => ({ '@type': 'ListItem', position: i + 1, name: step.name, item: abs(step.path) })),
    };
  }

  function itemList({ path, name, items }) {
    return {
      '@type': 'ItemList',
      '@id': `${abs(path)}#itemlist`,
      name,
      itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, url: abs(item.path) })),
    };
  }

  window.Seo = { setMeta, setLink, setJsonLd, setSeo, abs, builders: { organisation, offerCatalog, website, webPage, person, breadcrumb, itemList } };
})();
