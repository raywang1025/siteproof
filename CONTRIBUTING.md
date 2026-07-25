# Contributing

SiteProof accepts evidence-backed rules, bug fixes, documentation improvements,
and test fixtures.

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
node --test tests/*.test.mjs
node scripts/check-project.mjs
```
