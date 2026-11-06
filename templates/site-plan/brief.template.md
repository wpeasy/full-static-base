# Website brief: {{CLIENT_NAME}}

**Prepared by:** {{PREPARED_BY}}
**Client:** {{CLIENT_NAME}}, {{SECTOR_AND_PLACE}}
**Version:** {{VERSION_AND_DATE}}
**Companion documents:** moodboard.pdf, logo pack, content, open-questions.md

> {{ONE_LINE_COVER_NOTE: for example "Prepared from the material you supplied. Nothing has been invented."}}

> **ACTION FOR THE CLIENT: PLACEHOLDER DETAILS TO BE SUPPLIED.** Items tagged **[supply]** are facts we do not have yet: nothing has been invented, and a placeholder stands in until you send them. Items tagged **[confirm]** are working assumptions we made so the plan could move on: please approve or correct each one. Nothing tagged this way is final, and nothing tagged this way will be published until you reply. The full list is in section 14, "Still to supply", and in open-questions.md.

---

## 1. The client in one paragraph

{{CLIENT_PARAGRAPH: who they are, what they do, where, team size, how work arrives today. Only facts the client gave.}}

## 2. Why a new site, and what success looks like

| Problem today | What we want instead |
|---|---|
| {{PROBLEM_1}} | {{OUTCOME_1}} |
| {{PROBLEM_2}} | {{OUTCOME_2}} |

**Goals, in priority order**

1. {{GOAL_1: from the client's own answers}}
2. {{GOAL_2}}
3. {{GOAL_3}}

**Measures of success:** {{MEASURES: only measures the client or the goals imply; targets they did not give are [supply]}}

## 3. Audience

{{AUDIENCE: ranked by the client's own answers, primary first. Each: who, what they need, what worries them. Mark any guess [confirm].}}

**Needs across all audiences:** {{SHARED_NEEDS}}

## 4. Brand positioning

- **Promise:** {{PROMISE}}
- **Personality:** {{PERSONALITY_FROM_CLIENT}}
- **Voice:** {{VOICE_RULES}}
- **Tagline:** {{TAGLINE_OR_[supply]}}
- **Brand idea:** {{BRAND_IDEA_AND_LOGO_RATIONALE}}

## 5. Visual direction (summary: see the mood board for detail)

{{VISUAL_DIRECTION: default theme, accent use, typography, photography, texture, motion. Say which theme is default and whether a second is wanted.}}

## 6. Sitemap and page requirements

```
{{SITEMAP_TREE: one line per page. Pages the client did not list but the site needs (privacy, 404, checklist or download pages, guides) are marked "(added)" in plain text, not as a tag.}}
```

{{PAGE_BY_PAGE: a ### per page: goal, sections in order, content source, calls to action. Content that was not supplied is [supply].}}

## 7. Functional requirements

{{FUNCTIONAL: forms and what they collect, contact methods, filtering, theme switching, performance and accessibility targets, SEO and schema types, analytics (privacy-respecting), static-hosting constraints. Note anything the client asked for that a static site cannot do and the proposed approach.}}

## 8. Content and assets supplied with this brief

| Item | Location | Notes |
|---|---|---|
| Logo pack | logo-pack/ | {{LOGO_NOTES: which files were supplied, which were redrawn}} |
| Favicon and app icons | logo-pack/favicon/ | generated from the supplied mark |
| Structured content | assets/content/ | JSON, ready for the data-driven pattern |
| Photography | assets/images/photos/ | {{PHOTO_STATUS: supplied, resolution, usable or placeholder only}} |
| Mood board | moodboard/moodboard.pdf | palette, type, imagery, interface mood |
| Open questions | open-questions.md | contradictions, missing facts, checks |

## 9. Typography

{{TYPE_TABLE: role, family, weights, use. Fonts are self-hosted per docs/fonts.md and not yet downloaded, or downloaded: say which. Fallback stacks.}}

## 10. Colour (starting tokens for `theme.css`)

{{COLOUR_TABLE: name, hex, OKLCH, role. From `node tools/contrast.mjs --palette ... --md`.}}

**Contrast (measured, WCAG 2.2):**

{{CONTRAST_TABLE: from `node tools/contrast.mjs --palette ... --md`. For any brand colour that fails AA for text: keep it for graphics and large text, propose a deeper text partner (`--suggest`), and mark it [confirm].}}

## 11. Photography shot list

{{SHOT_LIST: the real photography the brand's own rules call for. Supplied photos judged against those rules; low-resolution or generic stock images are placeholders only.}}

## 12. Accessibility, legal and compliance

- WCAG 2.2 AA; keyboard, screen reader and 200% zoom; reduced motion and forced colours respected.
- {{ACKNOWLEDGEMENT_OF_COUNTRY: for Australian businesses recommend one in the footer, marked [confirm] (the client did not ask for it)}}
{{COMPLIANCE: for regulated sectors (legal, medical, finance, licensed trades): advertising rules, required credentials and claims that must be verifiable, privacy and consent, disclaimers. This is a checklist for the client or their adviser to confirm, not advice. Mark each item [confirm].}}

## 13. Timeline, budget and handover

{{TIMELINE: phases and durations from the client's launch date and budget if given, otherwise [supply].}}

## 14. Still to supply (do not invent)

{{STILL_TO_SUPPLY: every fact the client did not give: legal names, ABN or licence numbers, addresses, phone, hours, review text, bios and portraits, prices, social URLs, domain, budget, launch date. One bullet each; the same items appear in open-questions.md.}}

## 15. Out of scope

{{OUT_OF_SCOPE: from the client's answers and the static-site constraints.}}
