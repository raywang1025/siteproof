# Architecture

```text
Popup
  └─ START_AUDIT
       └─ Manifest V3 service worker
            ├─ temporary Desktop tab
            ├─ temporary Tablet tab
            └─ temporary Mobile tab
                 ├─ CDP Emulation
                 ├─ CDP Page screenshot
                 ├─ CDP Console / Runtime / Network
                 └─ deterministic DOM evidence
                      ↓
                 merged local report
                      ↓
                 report page + JSON + repair prompt
```

## Evidence boundaries

1. `src/core/page-audit.js` runs inside the inspected page and returns facts.
2. `src/background.js` collects runtime and network evidence through Chrome.
3. `src/core/report-builder.js` merges duplicate evidence across viewports.
4. `src/core/heuristics.js` maps evidence to potential usability risks.
5. `src/core/markdown-report.js` creates a versionable audit report and a
   separate Codex repair packet.
6. `src/report/report.js` presents and exports the evidence.

The heuristic layer never turns “no automated finding” into “UX passed.”

## Localization boundary

English is the default interface language. Traditional Chinese is a persistent
display preference stored in `chrome.storage.local`. Visible navigation,
verdicts, UX questions, and known finding titles are localized; stable rule ids,
JSON keys, and repair-prompt structure remain English.

## Why no AI API in the PoC

Objective launch checks must remain reproducible, private, and testable. The
repair packet lets a user bring the evidence to an AI tool they already use. A
future optional AI adapter can interpret screenshots and brand rules, but its
inferences must remain visibly separate from observed evidence.
