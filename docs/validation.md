# Validation record

## Automated checks

The repository currently verifies:

- Manifest V3 structure and required files;
- required Chrome permissions;
- JavaScript syntax for every Extension module;
- finding deduplication across viewports;
- grouping repeated contrast failures by foreground/background color pair;
- separating the WCAG 24px touch minimum from the 44px comfort recommendation;
- excluding elements injected by other browser extensions;
- collapsing a failed-resource Console line into its matching Network failure;
- launch-verdict calculation;
- English and Traditional Chinese Markdown audit-report generation;
- a stable English Codex repair packet embedded in the audit report;
- all ten UX heuristics remain `needs-human-review` when no supporting evidence
  exists.

Commands:

```bash
node --test tests/*.test.mjs
node scripts/check-project.mjs
```

## Intentionally broken fixture

`fixtures/broken-site/index.html` contains known problems:

- fixed-width layout that Chrome shrinks into the mobile screen;
- missing title, description, language, H1, and image alt;
- failed image request;
- Console error and uncaught exception;
- touch targets below the 44px comfort recommendation;
- low-contrast text;
- ambiguous links;
- required field without a label, guidance, or error relationship.

The complete Chrome Extension path must detect these issues before the PoC is
marked validated.

## End-to-end gates

- [x] Load the unpacked Extension without a manifest error.
- [x] Audit the local fixture at all three viewports.
- [x] Produce three screenshots.
- [x] Collect the deliberate runtime and network failures.
- [x] Open the local report page.
- [x] Export a valid full Markdown report.
- [x] Export and inspect the JSON evidence file.
- [x] Audit `https://taneverse.com/`.
- [x] Review the first Taneverse report for rule-level false positives.
- [x] Rescan Taneverse with the calibrated rules before publishing a sample report.
- [x] Confirm that the fixture reports the mobile fixed-layout scale mismatch.

This record deliberately separates code checks from browser validation. A passing
unit test is not evidence that Chrome granted the debugger permission or that a
real page produced a reliable report.
