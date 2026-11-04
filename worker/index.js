// Cloudflare Worker for Workers Static Assets (wrangler.jsonc). One job: answer /<ROUTE>/<slug> with the single
// template page. Everything else is served by the static assets binding. See docs/hosting.md.
// Set the two constants for the collection and keep wrangler.jsonc `run_worker_first` as "/<ROUTE>/*".
//   ROUTE    URL segment of the detail pages        (/item/amelie-dubois  -> 'item')
//   TEMPLATE template file name without .html       (public/item.html     -> 'item')
// ROUTE and TEMPLATE may differ: a collection's list page and its detail template must not share a name
// (list /things, template /thing: ROUTE 'thing', TEMPLATE 'thing', list page things.html).
//
// Fetch `/<TEMPLATE>`, NOT `/<TEMPLATE>.html`: Workers Static Assets redirects the .html URL to the clean one, which
// would change the address in the visitor's browser.

const ROUTE = 'item';
const TEMPLATE = 'item';
const slugPath = new RegExp(`^/${ROUTE}/[^/]+/?$`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (slugPath.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL(`/${TEMPLATE}`, url), request));
    }
    return env.ASSETS.fetch(request);
  },
};
