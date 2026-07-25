import test from "node:test";
import assert from "node:assert/strict";

import {
  buildReport,
  mergeFindings,
  summarize
} from "../src/core/report-builder.js";

function result(viewportId, findings) {
  return {
    viewport: { id: viewportId },
    page: {},
    inventory: {},
    primaryActions: [],
    findings
  };
}

test("merges the same finding across viewports", () => {
  const finding = {
    rule: "SEO_TITLE",
    severity: "major",
    category: "seo",
    title: "Missing page title",
    message: "No title",
    element: "head > title",
    evidence: null,
    heuristics: []
  };

  const merged = mergeFindings([
    result("desktop", [finding]),
    result("mobile", [finding])
  ]);

  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0].viewports, ["desktop", "mobile"]);
  assert.equal(merged[0].id, "SP-001");
});

test("marks a report with major findings as still needing work", () => {
  assert.deepEqual(summarize([{ severity: "major" }]), {
    verdict: "still-needs-work",
    counts: {
      blocker: 0,
      major: 1,
      minor: 0,
      observation: 0
    },
    total: 1
  });
});

test("builds ten heuristic review entries without claiming a pass", () => {
  const report = buildReport({
    id: "test",
    url: "https://example.com/",
    startedAt: "2026-07-25T00:00:00.000Z",
    completedAt: "2026-07-25T00:00:01.000Z",
    primaryTask: "Understand the offer.",
    viewportResults: [result("desktop", [])],
    runtimeFindings: [],
    screenshots: {}
  });

  assert.equal(report.heuristicReview.length, 10);
  assert.ok(
    report.heuristicReview.every(
      (heuristic) => heuristic.status === "needs-human-review"
    )
  );
  assert.ok(
    report.heuristicReview.every(
      (heuristic) => heuristic.questionEn && heuristic.questionZh
    )
  );
  assert.match(report.heuristicSource.url, /nngroup\.com/);
});
