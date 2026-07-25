import { HEURISTICS } from "./heuristics.js";

const HEURISTIC_BY_ID = new Map(
  HEURISTICS.map((heuristic) => [heuristic.id, heuristic])
);

const REPORT_COPY = {
  en: {
    title: "SiteProof Audit Report",
    generated: "Generated",
    primaryTask: "Primary user task",
    verdict: "Verdict",
    summary: "Executive summary",
    blocker: "Blocker",
    major: "Major",
    minor: "Minor",
    observation: "Observation",
    total: "Total evidence",
    viewports: "Audited viewports",
    viewportNote:
      "Screenshots are stored in the local SiteProof report. They are not embedded as base64 data in this Markdown file.",
    findings: "Verified findings",
    noFindings:
      "No deterministic issue was found. This does not prove that the user experience has passed.",
    severity: "Severity",
    category: "Category",
    rule: "Rule",
    element: "Element",
    message: "Message",
    evidence: "Evidence",
    heuristicReview: "UX heuristic review",
    heuristicNote:
      "These are potential risks organized by Jakob Nielsen’s usability heuristics. They are not an NN/g certification or a substitute for usability testing.",
    status: "Status",
    question: "Review question",
    relatedEvidence: "Related evidence",
    limitations: "Limitations",
    codexHandoff: "Codex handoff",
    codexNote:
      "The following repair packet is included so this report can be attached directly to a Codex task.",
    verdicts: {
      "still-needs-work": "Still needs work",
      "review-before-launch": "Review before launch",
      "ready-with-observations": "Ready with observations"
    }
  },
  "zh-Hant": {
    title: "SiteProof 網站驗收報告",
    generated: "產生時間",
    primaryTask: "主要使用者任務",
    verdict: "驗收判斷",
    summary: "摘要",
    blocker: "阻擋上線",
    major: "主要問題",
    minor: "次要問題",
    observation: "觀察項",
    total: "證據總數",
    viewports: "檢查裝置",
    viewportNote:
      "截圖保存在 SiteProof 本機報告中。為了避免 Markdown 檔案過大，本檔不嵌入 base64 圖片。",
    findings: "已驗證問題",
    noFindings:
      "自動化規則沒有找到問題；這不代表使用者體驗已經通過。",
    severity: "嚴重度",
    category: "分類",
    rule: "規則",
    element: "元素",
    message: "原始訊息",
    evidence: "證據",
    heuristicReview: "UX 啟發式檢查",
    heuristicNote:
      "以下是依 Jakob Nielsen 易用性原則整理的潛在風險，不是 NN/g 認證，也不能取代真人使用測試。",
    status: "狀態",
    question: "檢查問題",
    relatedEvidence: "相關證據",
    limitations: "限制",
    codexHandoff: "交給 Codex 修正",
    codexNote:
      "以下 repair packet 讓這份報告可以直接附加到 Codex task。",
    verdicts: {
      "still-needs-work": "仍需修改",
      "review-before-launch": "上線前請複核",
      "ready-with-observations": "可上線，仍有觀察項"
    }
  }
};

export function buildRepairPrompt(data) {
  const findings = [...data.findings].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity)
  );
  const issueText = findings.length
    ? findings
        .map(
          (finding, index) => `${index + 1}. [${finding.severity.toUpperCase()}] ${
            finding.title
          }
   - Rule: ${finding.rule}
   - Message: ${finding.message}
   - Element: ${finding.element || "Not tied to one DOM element"}
   - Viewports: ${finding.viewports?.join(", ") || "all/unknown"}
   - Evidence: ${JSON.stringify(finding.evidence || {})}`
        )
        .join("\n\n")
    : "No deterministic issue was found. Do not assume this means the UX is proven.";

  const heuristicText = data.heuristicReview
    .map((heuristic) => {
      const localized = heuristicTextFor(heuristic);
      return `- ${heuristic.id} ${localized.title}: ${localized.questionEn} Status: ${
        heuristic.status
      }${
          heuristic.relatedFindings.length
            ? `; related evidence: ${heuristic.relatedFindings.join(", ")}`
            : ""
        }`;
    })
    .join("\n");

  return `# SiteProof repair packet

Website: ${data.url}
Audited at: ${data.completedAt}
Primary user task: ${data.primaryTask}
Current verdict: ${data.summary.verdict}

## Your job

Fix the verified technical and accessibility issues below without changing the site's intended visual identity.

Rules:
1. Inspect the existing codebase before editing.
2. Preserve working behavior and responsive layouts.
3. Address blocker and major findings first.
4. Do not invent brand facts or user evidence.
5. For UX heuristic questions, cite a screenshot, DOM element, interaction state, or code path.
6. If the page alone cannot prove an answer, mark it "Needs user testing".
7. After editing, recheck widths 1440, 768, and 390 CSS px.

## Verified findings

${issueText}

## UX heuristic review

Framework reference: ${data.heuristicSource.url}
This is an independent heuristic review, not an NN/g certification.

${heuristicText}

## Required response

Return:
- files changed;
- verified issues fixed;
- issues intentionally left unchanged and why;
- UX questions that still require real-user testing;
- how you revalidated desktop, tablet, and mobile.
`;
}

export function buildMarkdownReport(data, locale = "en") {
  const selectedLocale = locale === "zh-Hant" ? "zh-Hant" : "en";
  const copy = REPORT_COPY[selectedLocale];
  const findings = [...data.findings].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity)
  );
  const repairPrompt = buildRepairPrompt(data);
  const frontMatter = [
    "---",
    `siteproof_schema: ${yamlValue(data.schemaVersion)}`,
    `audit_id: ${yamlValue(data.id)}`,
    `url: ${yamlValue(data.url)}`,
    `audited_at: ${yamlValue(data.completedAt)}`,
    `verdict: ${yamlValue(data.summary.verdict)}`,
    `blocker: ${Number(data.summary.counts.blocker || 0)}`,
    `major: ${Number(data.summary.counts.major || 0)}`,
    `minor: ${Number(data.summary.counts.minor || 0)}`,
    `observation: ${Number(data.summary.counts.observation || 0)}`,
    "---"
  ].join("\n");

  const findingText = findings.length
    ? findings.map((finding) => markdownFinding(finding, copy)).join("\n\n")
    : copy.noFindings;

  const heuristicText = data.heuristicReview
    .map((heuristic) => markdownHeuristic(heuristic, copy, selectedLocale))
    .join("\n\n");

  const limitationText = data.limitations
    .map((limitation) => `- ${limitation}`)
    .join("\n");

  return `${frontMatter}

# ${copy.title}

| | |
| --- | --- |
| URL | ${markdownLink(data.url)} |
| ${copy.generated} | ${escapeTable(data.completedAt)} |
| ${copy.verdict} | **${escapeTable(
    copy.verdicts[data.summary.verdict] || data.summary.verdict
  )}** |
| ${copy.primaryTask} | ${escapeTable(data.primaryTask)} |

## ${copy.summary}

| ${copy.blocker} | ${copy.major} | ${copy.minor} | ${copy.observation} | ${copy.total} |
| ---: | ---: | ---: | ---: | ---: |
| ${Number(data.summary.counts.blocker || 0)} | ${Number(
    data.summary.counts.major || 0
  )} | ${Number(data.summary.counts.minor || 0)} | ${Number(
    data.summary.counts.observation || 0
  )} | ${Number(data.summary.total || 0)} |

## ${copy.viewports}

| Viewport | Size |
| --- | ---: |
| Desktop | 1440 × 900 |
| Tablet | 768 × 1024 |
| Mobile | 390 × 844 |

> ${copy.viewportNote}

## ${copy.findings}

${findingText}

## ${copy.heuristicReview}

> ${copy.heuristicNote}
>
> Source: ${data.heuristicSource.url}

${heuristicText}

## ${copy.limitations}

${limitationText}

## ${copy.codexHandoff}

${copy.codexNote}

<details>
<summary>SiteProof repair packet</summary>

\`\`\`markdown
${repairPrompt.trim()}
\`\`\`

</details>
`;
}

function markdownFinding(finding, copy) {
  return `### ${finding.id} · ${finding.title}

- **${copy.severity}:** ${finding.severity}
- **${copy.category}:** ${finding.category}
- **${copy.rule}:** \`${inlineCode(finding.rule)}\`
- **Viewports:** ${finding.viewports?.join(", ") || "all/unknown"}
- **${copy.element}:** ${
    finding.element ? `\`${inlineCode(finding.element)}\`` : "—"
  }
- **${copy.message}:** ${finding.message}

**${copy.evidence}**

\`\`\`json
${JSON.stringify(finding.evidence || {}, null, 2)}
\`\`\``;
}

function markdownHeuristic(heuristic, copy, locale) {
  const localized = heuristicTextFor(heuristic);
  const title = locale === "zh-Hant" ? localized.titleZh : localized.title;
  const question =
    locale === "zh-Hant" ? localized.questionZh : localized.questionEn;
  return `### ${heuristic.id} · ${title}

- **${copy.status}:** ${heuristic.status}
- **${copy.question}:** ${question}
- **${copy.relatedEvidence}:** ${
    heuristic.relatedFindings.length
      ? heuristic.relatedFindings.join(", ")
      : "—"
  }`;
}

function heuristicTextFor(heuristic) {
  const canonical = HEURISTIC_BY_ID.get(heuristic.id) || {};
  return {
    title:
      heuristic.title ||
      canonical.title ||
      heuristic.titleZh ||
      canonical.titleZh ||
      heuristic.id,
    titleZh:
      heuristic.titleZh ||
      canonical.titleZh ||
      heuristic.title ||
      canonical.title ||
      heuristic.id,
    questionEn:
      heuristic.questionEn ||
      canonical.questionEn ||
      heuristic.question ||
      heuristic.questionZh ||
      canonical.questionZh ||
      "",
    questionZh:
      heuristic.questionZh ||
      canonical.questionZh ||
      heuristic.question ||
      heuristic.questionEn ||
      canonical.questionEn ||
      ""
  };
}

function severityRank(severity) {
  return {
    blocker: 0,
    major: 1,
    minor: 2,
    observation: 3
  }[severity] ?? 9;
}

function yamlValue(value) {
  return JSON.stringify(String(value ?? ""));
}

function markdownLink(value) {
  const safe = String(value).replace(/[()]/g, "\\$&");
  return `[${safe}](${safe})`;
}

function escapeTable(value) {
  return String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
}

function inlineCode(value) {
  return String(value ?? "").replaceAll("`", "\\`");
}
