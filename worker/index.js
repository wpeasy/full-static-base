// Cloudflare Worker for Workers Static Assets (wrangler.jsonc). One job: answer /item/<slug> with the single
// template page. Everything else is served by the static assets binding. See docs/hosting.md.
// Rename SINGULAR to match the collection (js/<collection>-data.js, public/<singular>.html).
//
// Fetch `/item`, NOT `/item.html`: Workers Static Assets redirects the .html URL to the clean one, which
// would change the address in the visitor's browser.

const SINGULAR = 'item';
const slugPath = new RegExp(`^/${SINGULAR}/[^/]+/?$`);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (slugPath.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL(`/${SINGULAR}`, url), request));
    }
    return env.ASSETS.fetch(request);
  },
};
