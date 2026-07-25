# Contributing

SiteProof accepts evidence-backed rules, bug fixes, documentation improvements,
and test fixtures.

## Choose a contribution path

- Report a reproducible Extension or evidence problem with the
  [bug report form](https://github.com/raywang1025/siteproof/issues/new?template=bug_report.yml).
- Propose a check with a primary source and clear evidence requirements with the
  [rule proposal form](https://github.com/raywang1025/siteproof/issues/new?template=rule_proposal.yml).
- Improve code or documentation by forking the repository and opening a pull
  request.

Please search existing issues before opening a new one. Do not include private
URLs, credentials, customer data, or reports from sensitive sites.

## Fork and pull request workflow

1. Fork `raywang1025/siteproof`.
2. Create a focused branch in your fork.
3. Make one evidence-backed change.
4. Run the local checks below.
5. Open a pull request and explain the evidence, expected behavior, and limits.

Small pull requests are easier to review. A proposal does not need to include
code when the rule or product decision still needs discussion.

## A rule must include

- a stable rule id;
- the context in which it applies;
- the evidence required to report it;
- an automation level (`automatic`, `assisted`, or `human`);
- a severity rationale;
- tests or an intentionally broken fixture;
- a primary source when the rule is derived from published guidance.

Do not copy full articles, proprietary workbooks, posters, or copyrighted
examples into the repository. Summarize the principle in original language and
link to the source.

## UX heuristic findings

Heuristic findings are potential risks, not proof of user behavior. If a claim
requires a real participant completing a real task, mark it `needs-human-review`.

## Local checks

```bash
npm test
npm run check
```

If the change affects browser behavior, also load the extension and test it
against the deliberately broken fixture:

```bash
npm run fixture
```

## Pull request evidence

Include:

- the user-visible problem being addressed;
- the page or fixture state needed to reproduce it;
- before/after screenshots when the interface changes;
- test output;
- known false positives, exceptions, or remaining human-review needs.
