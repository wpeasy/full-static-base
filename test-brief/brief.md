# Website brief: Banksia Build Co.

**Prepared by:** Tidewater Creative (brand and web design agency)
**Client:** Banksia Build Co., carpentry and building, Gold Coast, Queensland
**Version:** 1.0 (test brief for the full-static-base framework)
**Companion documents:** [moodboard.pdf](moodboard/moodboard.pdf), [logo pack](logo-pack/), [content](assets/content/)

> This is a fictional client created to test the framework. Every business fact marked **[supply]** is deliberately missing. Do not invent it: leave it out and list it as "still to supply" (see AGENTS.md, SEO section).

---

## 1. The client in one paragraph

Banksia Build Co. is a small owner-operated team of carpenters and builders working across the Gold Coast, from Burleigh and Palm Beach up to Coomera and out to the hinterland. They build decks, pergolas, outdoor kitchens, custom cabinetry, renovations and small extensions. Founder-led, about eight years in business, a crew of five. Most work arrives by word of mouth and Instagram; the current website is a one-page template that no longer reflects the quality of the work.

## 2. Why a new site, and what success looks like

| Problem today | What we want instead |
|---|---|
| Looks like every other tradie template; quality of work is hidden | A site that feels as crafted as the builds |
| Enquiries come as unqualified phone calls and DMs | Structured quote requests that arrive with scope, suburb and budget |
| No proof of licence, insurance or past work | Trust signals up front: licence, insurance, warranty, real projects |
| Slow and heavy on mobile | Fast on a patchy phone connection on a job site or a beach |

**Goals, in priority order**

1. Generate **qualified quote requests** (target: 15 to 25 a month within six months of launch).
2. Make the work look as good online as it does on site, so price becomes a smaller part of the conversation.
3. Build trust fast: licensed, insured, local, and easy to reach.
4. Rank for local searches such as "deck builder Gold Coast", "pergola Burleigh", "custom cabinetry Gold Coast".
5. Give the founder a site that is easy to keep current with new projects without a developer.

**Measures of success:** quote-form completion rate, click-to-call taps, Core Web Vitals in the green, Lighthouse accessibility 100, a Google Business Profile link-through, and the number of enquiries that name a specific service and suburb.

## 3. Audience

**Primary: the homeowner investing in their place (60% of work).** 35 to 60, owns a home or townhouse on the Gold Coast, household income comfortably above average. Planning a deck, pergola, outdoor kitchen or reno. Researches on a phone in the evening, compares three builders, wants to see finished work, wants to know the builder will turn up, finish on time and be honest about price. Anxious about cowboy tradies and cost blowouts.

**Secondary: the property investor and body corporate manager (25%).** Wants repeatable, reliable work: balcony repairs, fencing, timber replacement, compliance fixes. Cares about licence, insurance, paperwork and speed of quote.

**Tertiary: architects, designers and real estate agents (15%).** Wants a builder to refer. Looks for a project gallery, materials knowledge and a professional tone.

**Needs across all three:** see real work, confirm credentials, understand the process, get a price range, make contact in one or two taps.

## 4. Brand positioning

- **Promise:** Well built, honestly priced, finished properly.
- **Personality:** warm, direct, skilled, a bit sun-baked and good-humoured. Never corporate, never "mate-rates" tradie cliché.
- **Voice:** plain Australian English. Short sentences. Say what the job involves and what it costs to start. No jargon, no hype, no exclamation marks.
- **Tagline:** *Built to last. Built for the coast.*
- **Brand idea:** the banksia is a tough, native Gold Coast tree with a seed pod that opens only after fire. Resilient, local, beautiful once you look closely. The logo mark is a bold, square-edged **B**: a teal spine that reads as a carpenter's square edge, and two warm bowls. The banksia lives in the name and the story, not as a literal illustration.

## 5. Visual direction (summary: see the mood board for detail)

- **Dark by default.** Deep ink-navy background, warm off-white text. The site opens in dark; a light theme is offered through the theme toggle and must be fully designed, not an inversion.
- **Vibrant accents** used with discipline: *Ember* orange for primary actions and highlights, *Surf* aqua for secondary accents and links, *Sunshine* yellow for small flashes (badges, ratings, focus accents).
- **Typography:** two Google Fonts plus one small mono accent, all **self-hosted** (see section 9).
- **Photography:** real project photos, low sun, warm timber against deep shadow. Detail shots of joinery. People at work, faces optional.
- **Texture:** faint blueprint grid and timber-grain patterns used sparingly as section backgrounds.
- **Motion:** subtle. Entrance fades and a slow reveal on gallery images. All movement opt-in under `prefers-reduced-motion: no-preference`.

## 6. Sitemap and page requirements

```
/                      Home
/services              Services overview (JSON-driven list)
/services/<slug>       One template page per service (JSON-driven)
/projects              Project gallery with filtering by service and suburb
/projects/<slug>       Project case study (JSON-driven)
/process               How we work: from first call to handover
/about                 The crew, story, credentials
/reviews               Customer reviews
/journal               Short helpful articles (cost guides, timber choices)
/journal/<slug>        Article
/contact               Quote request form, phone, service area
/privacy               Privacy policy
/404
```

### Home
Goal: within five seconds a visitor knows who, where, what and how to get a quote.

1. Header: logo, nav, phone number tap target, "Get a quote" button, theme toggle.
2. Hero: full-bleed project photo, headline, one-line proposition, two buttons (Get a quote, See our work). Credentials strip underneath.
3. Services: six cards linking to service pages.
4. Featured projects: three large images with suburb and service tags.
5. Why Banksia: four short proof points (licensed and insured, fixed-price quotes, one crew start to finish, 7-year workmanship warranty **[confirm]**).
6. Process in four steps.
7. Reviews: three quotes with a link to all.
8. Service area: list of suburbs (no map embed that loads third-party scripts).
9. Closing call to action with the quote form teaser.
10. Footer: contact, licence number **[supply]**, service area, social links, acknowledgement of Country.

### Services
Six services, each with its own page: **Decks and patios**, **Pergolas and awnings**, **Outdoor kitchens**, **Custom cabinetry and joinery**, **Renovations and extensions**, **Repairs and maintenance**. Each page: what is included, typical timeframe, "from" price guide **[supply]**, materials we recommend for coastal conditions, three related projects, FAQ, quote button. Content lives in [services.json](assets/content/services.json).

### Projects
Filterable gallery (service and suburb). Each case study: before and after, the brief, materials, duration, a short client quote, photo set of 6 to 12. Content shape in [projects.json](assets/content/projects.json).

### Process
Four steps with honest timeframes: Call and site visit, Fixed-price quote, Build, Handover and warranty. Include "what we need from you" and "what you can expect from us".

### About
Founder story, the crew (names, roles, a line each), credentials, community involvement, a short statement on materials and sustainability (certified timber where possible).

### Reviews
Real reviews only. The brief supplies placeholders in [reviews.json](assets/content/reviews.json); the client replaces them. Aggregate rating schema is added **only** when real, verifiable numbers are supplied.

### Journal
Four launch articles (outlines in the content folder). Plain, practical, useful for search: "How much does a deck cost on the Gold Coast?", "Merbau, spotted gum or composite? Choosing decking for salt air", "Do I need council approval for a pergola?", "What a fixed-price quote should include".

### Contact
Quote form (name, phone, email, suburb, service, rough budget band, timeframe, description, optional photo links), plus click-to-call, email, service-area note and opening hours **[supply]**. Form must work without JavaScript to the extent the host allows, validate accessibly, and give a clear success message. No CAPTCHA that blocks assistive technology; use a honeypot field.

## 7. Functional requirements

- Static HTML and CSS, no build step, per the framework. Content-driven pages built from JSON with one template page each.
- Click-to-call on mobile, persistent but unobtrusive "Get a quote" in the header.
- Project and service filtering (no page reload) with a no-JavaScript fallback list.
- Light and dark themes, dark default, saved choice, no flash on load.
- Fully keyboard operable, WCAG 2.2 AA minimum, reflows at 320px and 200% zoom.
- Works on mid-range Android phones on 4G: aim for LCP under 2.5s, total page weight under 1.5MB on the home page.
- Images WebP with `width` and `height`; first-screen images eager, the rest lazy.
- SEO: unique titles and descriptions, `LocalBusiness` (`HomeAndConstructionBusiness`) JSON-LD, `Service`, `ImageObject`, `Article` and `BreadcrumbList` where visible, sitemap, clean URLs.
- Analytics: privacy-respecting only (for example Plausible or none). No cookie banner required if no tracking cookies are used.

## 8. Content and assets supplied with this brief

| Item | Location | Notes |
|---|---|---|
| Logo pack (on-dark, on-light, white, black; horizontal, stacked, mark; favicon and app icons) | [logo-pack/](logo-pack/) | SVG masters, PNG exports |
| Social images and header images, light and dark | [logo-pack/social/](logo-pack/social/), [logo-pack/headers/](logo-pack/headers/) | Illustrative artwork used in place of photography for testing |
| Self-hosted fonts and `fonts.css` | [assets/fonts/](assets/fonts/) | woff2, latin and latin-ext, ready to copy to `public/fonts/` |
| Mood board (PDF) | [moodboard/moodboard.pdf](moodboard/moodboard.pdf) | Palette, type, texture, imagery, UI mood |
| Services, projects, reviews, FAQs, site facts | [assets/content/](assets/content/) | JSON, ready for the data-driven pattern |
| Textures | [assets/images/](assets/images/) | Blueprint grid and timber grain SVG |
| Photography | not supplied | Shot list in section 10 |

## 9. Typography (self-hosted Google Fonts)

All fonts are open source (SIL OFL) from Google Fonts but **must be served from the site itself**: no `fonts.googleapis.com` or `fonts.gstatic.com` requests at runtime. Follow [docs/fonts.md](../docs/fonts.md): variable woff2, split into `latin` and `latin-ext`, `font-display: swap`, preload only the above-the-fold `latin` files.

| Role | Family | Weights | Use |
|---|---|---|---|
| Headings and display | **Barlow Condensed** | 600 to 800 | H1 to H4, buttons, nav, large numerals. Uppercase for H1/H2 at large sizes |
| Body and UI | **Figtree** (variable) | 400 to 700 | Paragraphs, forms, captions |
| Accent / data | **DM Mono** | 400, 500 | Measurements, prices ("from $"), tags, project spec lists |

Fallback stacks: `"Barlow Condensed", "Arial Narrow", sans-serif`; `"Figtree", system-ui, sans-serif`; `"DM Mono", ui-monospace, monospace`. Because Barlow Condensed is not a variable font on Google Fonts, ship only the weights used (600, 700, 800) as static woff2, and note the `--weight-*` tokens accordingly.

## 10. Colour (starting tokens for `theme.css`)

Dark is the default. Semantic values below; the build derives the full ramps in OKLCH.

| Token | Name | Hex | OKLCH (approx) | Role |
|---|---|---|---|---|
| surface base | Ink | `#0F1419` | `oklch(0.19 0.01 249)` | Page background |
| surface raised | Slate | `#18202A` | `oklch(0.24 0.02 254)` | Cards, header |
| surface high | Harbour | `#232E3B` | `oklch(0.30 0.03 253)` | Hover, inputs |
| primary | Ember | `#FF5A1F` | `oklch(0.68 0.21 38)` | Primary buttons, key highlights |
| secondary | Surf | `#19D9C8` | `oklch(0.80 0.14 185)` | Links, secondary accents |
| tertiary | Sunshine | `#FFC933` | `oklch(0.86 0.16 87)` | Badges, ratings, small flashes |
| text | Sand | `#F4EFE6` | `oklch(0.95 0.01 82)` | Body text |
| text muted | Fog | `#A9B4C0` | `oklch(0.77 0.02 250)` | Secondary text |

**Light theme:** Sand as the page background, Ink as text. Accents are deepened and split by use:

| Use | Ember | Surf | Sunshine |
|---|---|---|---|
| Graphics, buttons, large text | `#E04A0F` (3.6:1 on Sand, Ink text on it 4.5:1) | `#0A9D90` | `#E8A800` |
| Body-size text and links | `#B93A08` (5.0:1 on Sand) | `#077A70` (4.6:1 on Sand) | never as text |

**Contrast on dark (measured):** Sand on Ink 16.2, Fog on Ink 8.8, Ember on Ink 5.9, Surf on Ink 10.4, Sunshine on Ink 12.0, Ink on Ember (primary button) 5.9. All pass AA for body text. On light, Ember `#E04A0F` and Surf `#0A9D90` are for graphics and large text only; use the deep partners for text (the framework's `-a11y` tokens should reproduce this).

**Rule:** on dark, accents may be used as text. On light, use the deep partners for body-size text.

## 11. Photography shot list (for the client to commission)

1. Hero: finished deck or pergola at golden hour, wide, with a long horizontal composition for text overlay on the left.
2. Six service images, one per service, 3:2 landscape.
3. Detail macro: joinery, a chiselled edge, oiled timber.
4. The crew on site, candid, 2 to 3 portraits at 4:5.
5. Before and after pairs for at least four projects.
6. Vertical hero crop for mobile (4:5).

Until then, the illustrative header images in the logo pack stand in.

## 12. Accessibility, legal and compliance

- WCAG 2.2 AA, tested with keyboard, screen reader and 200% zoom. Respect `prefers-reduced-motion` and `forced-colors`.
- Display the QBCC licence number **[supply]** in the footer and on the About page.
- Privacy policy covering the quote form and any email storage.
- Include an Acknowledgement of Country in the footer.
- All photos need consent for use. Alt text describes the work, not "image of deck".

## 13. Timeline, budget and handover (for the test scenario)

| Phase | Duration |
|---|---|
| Theme, tokens and component review | 1 week |
| Home, services template, contact | 2 weeks |
| Projects, process, about, reviews | 1.5 weeks |
| Journal, SEO, schema, performance | 1 week |
| QA, content load, launch | 0.5 week |

Handover includes a short guide for adding a project or service by editing JSON, plus the host and deploy notes.

## 14. Still to supply (do not invent)

- ABN, QBCC licence number, insurer and policy details
- Phone, email, street or service-area address, opening hours
- Real reviews and ratings, review platform links
- Pricing guides ("from" figures) and warranty terms
- Project photography and permissions
- Social profile URLs
- Founder and crew names, bios and portraits
- Domain name and preferred form handler

## 15. Out of scope

Online payments, client logins, live chat, third-party map embeds, e-commerce, a CMS, blog comments, and any tracking that requires a cookie banner.
