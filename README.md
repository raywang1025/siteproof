# SiteProof

Evidence-first launch checks for AI-built websites.

SiteProof is an open-source Chrome Extension PoC that audits one public page in
Desktop, Tablet, and Mobile viewports, keeps the evidence local, and produces a
repair packet that can be pasted into Codex or Claude.

The interface defaults to English for global open-source use. Popup and report
pages include a persistent Traditional Chinese switch. Rule ids, JSON fields,
and the repair-prompt format remain English so integrations have one stable
schema.

> Current status: validated `v0.1.0` technical proof of concept. Do not treat a
> PoC report as a production security audit, accessibility certification, or
> usability test.

## What the PoC checks

- three viewport screenshots: 1440×900, 768×1024, and 390×844;
- JavaScript exceptions and Console errors;
- HTTP errors and failed resources;
- horizontal overflow, offscreen elements, and fixed layouts that Chrome shrinks
  to fit a mobile screen;
- grouped 24px minimum touch-target failures and 44px mobile comfort observations;
- missing title, meta description, image `alt`, page language, and main landmark;
- heading structure and unnamed controls;
- basic estimated text contrast;
- evidence-linked UX heuristic risks;
- “still needs work / review / ready with observations” verdict;
- JSON evidence, a full Markdown audit report, and a separate repair packet.
- English interface with a persistent Traditional Chinese translation switch.

## Why a Chrome Extension?

The intended user is a creator or designer already looking at the site they want
to ship. A toolbar action removes the Node.js and Terminal setup required by a
local Playwright server.

Chrome's
[`debugger` API](https://developer.chrome.com/docs/extensions/reference/api/debugger)
provides supported DevTools Protocol domains for Emulation, Page, Runtime, Log,
and Network inspection. This permission is powerful, so SiteProof:

- opens isolated temporary audit tabs;
- attaches only while a viewport is being checked;
- detaches and closes every temporary tab;
- never uploads evidence;
- keeps reports in local extension storage;
- publishes the full source.

Read [SECURITY.md](./SECURITY.md) before installing the PoC.

## Load the unpacked extension

1. Clone or download this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the repository root (the folder containing `manifest.json`).
6. Open `https://taneverse.com/`.
7. Click SiteProof and choose **開始驗收**.

Chrome will show a debugger notice while each temporary audit tab is attached.
This is expected.

## Default primary task

> A first-time visitor can understand what the site offers, find the key
> information, and identify the primary next step.

You can replace this task before every audit. The heuristic report uses
[Jakob Nielsen’s 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
as an organizing framework. SiteProof is independent and is not affiliated with
or endorsed by Nielsen Norman Group.

The report carefully distinguishes:

- **confirmed issue** — direct browser or DOM evidence;
- **potential UX risk** — evidence mapped to a heuristic;
- **needs human review** — cannot be proven without a real task and participant.

## Test the rule engine

The repository includes a deliberately broken site:

```bash
node scripts/serve-fixture.mjs
```

Open `http://127.0.0.1:4173/`, run SiteProof, and expect findings for a mobile
fixed-layout mismatch, missing metadata, missing image alt, touch comfort, low
contrast, a failed image, and a deliberate JavaScript exception.

Run repository checks:

```bash
node --test tests/*.test.mjs
node scripts/check-project.mjs
```

No runtime package installation or build step is required.

## Architecture

See [docs/architecture.md](./docs/architecture.md) and
[docs/ux-heuristics.md](./docs/ux-heuristics.md). Browser validation is tracked
separately in [docs/validation.md](./docs/validation.md).
Release changes are listed in [CHANGELOG.md](./CHANGELOG.md).

## Not in the PoC

- multi-page crawling;
- authenticated or private pages;
- form submission and purchase flows;
- real-user usability testing;
- automatic code changes;
- AI API calls;
- `brand.md`, Pisci System, or Design System semantic review;
- cloud accounts, report history, or subscriptions.

## Roadmap

- [x] evidence model and three viewport definitions;
- [x] Manifest V3 popup, service worker, and report page;
- [x] deterministic DOM checks;
- [x] Console, Runtime, and Network collection;
- [x] UX heuristic evidence states;
- [x] JSON, full Markdown audit report, and Codex repair packet export;
- [x] validate the full Extension flow against Taneverse;
- [ ] bundle a mature accessibility engine after license and size review;
- [ ] add optional `brand.md` / Pisci rule input;
- [ ] add an optional BYOK AI interpretation layer;
- [ ] prepare Chrome Web Store privacy disclosures after the GitHub PoC is stable.

## License

[MIT](./LICENSE)
