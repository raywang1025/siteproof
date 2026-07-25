# Changelog

All notable changes to SiteProof are documented in this file.

## 0.1.0 — 2026-07-25

First public proof of concept.

### Included

- isolated Desktop, Tablet, and Mobile audit tabs;
- viewport screenshots stored in the local report;
- Console, JavaScript exception, failed request, and HTTP error evidence;
- deterministic SEO, structure, accessibility, responsive, and link checks;
- fixed-layout detection when Chrome shrinks a wide page into a mobile screen;
- WCAG 24px touch-target minimum checks with separate 44px comfort observations;
- evidence-linked UX heuristic questions based on Jakob Nielsen’s framework;
- English interface with a persistent Traditional Chinese translation;
- full Markdown report, JSON evidence, and Codex repair-packet export;
- local-only evidence storage with no AI API key or cloud account.

### Validated against

- the intentionally broken local fixture;
- `https://taneverse.com/` as a real public-site calibration case.

### Known limitations

- one page per audit;
- no authenticated pages, form submission, or task-flow crawling;
- heuristic review does not replace testing with real participants;
- contrast results are estimates based on computed text and ancestor colors.
