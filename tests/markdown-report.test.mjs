import test from "node:test";
import assert from "node:assert/strict";

import { buildReport } from "../src/core/report-builder.js";
import {
  buildMarkdownReport,
  buildRepairPrompt
} from "../src/core/markdown-report.js";

function sampleReport() {
  return buildReport({
    id: "audit-123",
    url: "https://taneverse.com/",
    startedAt: "2026-07-25T07:54:00.000Z",
    completedAt: "2026-07-25T07:54:17.000Z",
    primaryTask:
      "A first-time visitor can understand the offer and find a way to get in touch.",
    viewportResults: [
      {
        viewport: { id: "mobile" },
        page: {},
        inventory: {},
        primaryActions: [],
        findings: [
          {
            rule: "RESPONSIVE_OVERFLOW",
            severity: "major",
            category: "responsive",
            title: "Element extends beyond the viewport",
            message: "Element extends 24px beyond a 390px viewport.",
            element: "main > section.hero",
            evidence: { viewportWidth: 390, overflowBy: 24 },
            heuristics: []
          }
        ]
      }
    ],
    runtimeFindings: [],
    screenshots: {}
  });
}

test("builds a self-contained English Markdown audit report", () => {
  const markdown = buildMarkdownReport(sampleReport(), "en");

  assert.match(markdown, /^---/);
  assert.match(markdown, /^observation: 0$/m);
  assert.match(markdown, /# SiteProof Audit Report/);
  assert.match(markdown, /https:\/\/taneverse\.com\//);
  assert.match(markdown, /SP-001/);
  assert.match(markdown, /\| Blocker \| Major \| Minor \| Observation \| Total evidence \|/);
  assert.match(markdown, /UX heuristic review/);
  assert.match(markdown, /SiteProof repair packet/);
});

test("builds a Traditional Chinese display report with stable rule ids", () => {
  const markdown = buildMarkdownReport(sampleReport(), "zh-Hant");

  assert.match(markdown, /# SiteProof 網站驗收報告/);
  assert.match(markdown, /仍需修改/);
  assert.match(markdown, /RESPONSIVE_OVERFLOW/);
  assert.match(markdown, /交給 Codex 修正/);
});

test("repair prompt stays English and executable", () => {
  const prompt = buildRepairPrompt(sampleReport());

  assert.match(prompt, /# SiteProof repair packet/);
  assert.match(prompt, /Address blocker and major findings first/i);
  assert.match(prompt, /390 CSS px/);
});

test("legacy heuristic data never renders undefined", () => {
  const report = sampleReport();
  report.heuristicReview = report.heuristicReview.map((heuristic) => ({
    id: heuristic.id,
    title: heuristic.title,
    titleZh: heuristic.titleZh,
    question: heuristic.questionZh,
    status: heuristic.status,
    relatedFindings: heuristic.relatedFindings
  }));

  const english = buildMarkdownReport(report, "en");
  const chinese = buildMarkdownReport(report, "zh-Hant");
  const prompt = buildRepairPrompt(report);

  assert.doesNotMatch(english, /undefined/);
  assert.doesNotMatch(chinese, /undefined/);
  assert.doesNotMatch(prompt, /undefined/);
  assert.match(
    english,
    /After an important action, can people immediately tell whether/
  );
  assert.match(chinese, /重要操作後，使用者能否立即知道/);
});
