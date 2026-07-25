import { buildHeuristicReview, NNG_SOURCE } from "./heuristics.js";

export const DEFAULT_PRIMARY_TASK =
  "A first-time visitor can understand what the site offers, find the key information, and identify the primary next step.";

export const VIEWPORTS = [
  {
    id: "desktop",
    label: "Desktop",
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  },
  {
    id: "tablet",
    label: "Tablet",
    width: 768,
    height: 1024,
    deviceScaleFactor: 1,
    mobile: true
  },
  {
    id: "mobile",
    label: "Mobile",
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  }
];

function stableKey(finding) {
  return [
    finding.rule,
    finding.element || "",
    finding.message || "",
    JSON.stringify(finding.evidence || {})
  ].join(":");
}

export function mergeFindings(viewportResults, runtimeFindings = []) {
  const map = new Map();

  for (const result of viewportResults) {
    for (const finding of result.findings || []) {
      const key = stableKey(finding);
      const current = map.get(key);
      if (current) {
        current.viewports.push(result.viewport.id);
      } else {
        map.set(key, {
          ...finding,
          viewports: [result.viewport.id]
        });
      }
    }
  }

  for (const finding of runtimeFindings) {
    const key = stableKey(finding);
    const current = map.get(key);
    if (current) {
      if (!current.viewports.includes(finding.viewport)) {
        current.viewports.push(finding.viewport);
      }
    } else {
      map.set(key, {
        ...finding,
        viewports: finding.viewport ? [finding.viewport] : []
      });
    }
  }

  return [...map.values()].map((finding, index) => ({
    ...finding,
    id: `SP-${String(index + 1).padStart(3, "0")}`
  }));
}

export function summarize(findings) {
  const counts = {
    blocker: 0,
    major: 0,
    minor: 0,
    observation: 0
  };
  for (const finding of findings) {
    if (counts[finding.severity] !== undefined) {
      counts[finding.severity] += 1;
    }
  }

  let verdict = "ready-with-observations";
  if (counts.blocker || counts.major) verdict = "still-needs-work";
  else if (counts.minor) verdict = "review-before-launch";

  return {
    verdict,
    counts,
    total: findings.length
  };
}

export function buildReport({
  id,
  url,
  startedAt,
  completedAt,
  primaryTask = DEFAULT_PRIMARY_TASK,
  viewportResults,
  runtimeFindings = [],
  screenshots = {}
}) {
  const findings = mergeFindings(viewportResults, runtimeFindings);
  return {
    schemaVersion: "0.1.0",
    id,
    url,
    startedAt,
    completedAt,
    primaryTask,
    summary: summarize(findings),
    findings,
    viewportResults,
    screenshots,
    heuristicReview: buildHeuristicReview(findings, primaryTask),
    heuristicSource: NNG_SOURCE,
    limitations: [
      "UX heuristics identify potential risks; they do not replace usability testing with real participants.",
      "Contrast checks are estimates based on computed foreground and ancestor background colors.",
      "The PoC audits one public page and does not log in, submit forms, or follow task flows."
    ]
  };
}

export function runtimeFinding({
  viewport,
  type,
  message,
  url = null,
  status = null
}) {
  const isNetwork = type === "network";
  const isException = type === "exception";
  return {
    rule: isNetwork ? "RUNTIME_NETWORK" : isException ? "RUNTIME_JS" : "RUNTIME_LOG",
    severity: status >= 500 || isException ? "major" : "minor",
    category: "runtime",
    title: isNetwork
      ? "Resource failed to load"
      : isException
        ? "JavaScript exception"
        : "Console error",
    message,
    element: null,
    evidence: { url, status, type },
    heuristics: [],
    viewport
  };
}
