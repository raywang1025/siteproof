import {
  buildMarkdownReport,
  buildRepairPrompt
} from "../core/markdown-report.js";
import { HEURISTICS } from "../core/heuristics.js";

const LOCALE_KEY = "siteproofLocale";
const HEURISTIC_BY_ID = new Map(
  HEURISTICS.map((heuristic) => [heuristic.id, heuristic])
);

const COPY = {
  en: {
    localeToggle: "中文",
    copyPrompt: "Copy Codex prompt",
    downloadMarkdown: "Download report (.md)",
    downloadJson: "Download JSON",
    copied: "Codex repair prompt copied",
    kicker: "Launch evidence",
    verdictLabel: "SiteProof verdict",
    taskLabel: "Primary task",
    verdicts: {
      "still-needs-work": "Still needs work",
      "review-before-launch": "Review before launch",
      "ready-with-observations": "Ready with observations"
    },
    counts: ["Blocker", "Major", "Minor", "Observation", "Total evidence"],
    sections: {
      screenshots: "Three viewport captures",
      findings: "What the evidence proves",
      heuristics: "UX Heuristics",
      limitations: "Honest limitations"
    },
    intros: {
      screenshots:
        "Each image comes from a separate Chrome audit tab, not a resized copy of one screenshot.",
      findings:
        "Every finding includes an element, viewport, and measured evidence. An aesthetic preference without evidence is not treated as failure.",
      heuristics:
        "This layer identifies potential usability risks. It does not present a heuristic review as real-user usability testing."
    },
    noFindings:
      "No deterministic issue was found. This does not prove that the user experience has passed.",
    screenshotUnavailable: "Screenshot unavailable",
    viewports: "Viewports",
    notViewportSpecific: "not viewport-specific",
    heuristicStatus: {
      "potential-risk": "Potential risk",
      "needs-human-review": "Needs human review"
    },
    relatedEvidence: "Related evidence",
    sourceFramework: "Source framework",
    sourceDisclaimer:
      "This is an independent heuristic review, not an NN/g certification.",
    errorKicker: "Report unavailable",
    errorTitle: "The audit evidence could not be found"
  },
  "zh-Hant": {
    localeToggle: "English",
    copyPrompt: "複製 Codex 指令",
    downloadMarkdown: "下載驗收報告 (.md)",
    downloadJson: "下載 JSON",
    copied: "Codex 修正指令已複製",
    kicker: "上線證據",
    verdictLabel: "SiteProof 判斷",
    taskLabel: "主要任務",
    verdicts: {
      "still-needs-work": "仍需修改",
      "review-before-launch": "上線前請複核",
      "ready-with-observations": "可上線，仍有觀察項"
    },
    counts: ["阻擋上線", "主要問題", "次要問題", "觀察項", "證據總數"],
    sections: {
      screenshots: "三種裝置畫面",
      findings: "可以證明的問題",
      heuristics: "UX 啟發式檢查",
      limitations: "誠實的限制"
    },
    intros: {
      screenshots:
        "每張畫面由獨立的 Chrome 檢查分頁產生，不是把同一張截圖縮小。",
      findings:
        "每個問題都附上元素、裝置與測量證據。沒有證據的美感偏好不會被列為失敗。",
      heuristics:
        "這一層指出潛在易用性風險，不把啟發式檢查冒充真人使用測試。"
    },
    noFindings:
      "目前的自動化規則沒有找到問題；這不代表使用者體驗已經通過。",
    screenshotUnavailable: "無法取得截圖",
    viewports: "裝置",
    notViewportSpecific: "不限定裝置",
    heuristicStatus: {
      "potential-risk": "潛在風險",
      "needs-human-review": "需要人工確認"
    },
    relatedEvidence: "相關證據",
    sourceFramework: "參考框架",
    sourceDisclaimer: "這是獨立的啟發式檢查，不是 NN/g 認證。",
    errorKicker: "無法開啟報告",
    errorTitle: "找不到驗收證據"
  }
};

const FINDING_TITLE_ZH = {
  SEO_TITLE: "缺少頁面標題",
  SEO_DESCRIPTION: "缺少 meta description",
  A11Y_LANG: "缺少頁面語言",
  STRUCTURE_H1: "頁面 H1 結構異常",
  STRUCTURE_HEADING_ORDER: "標題層級跳號",
  A11Y_IMAGE_ALT: "圖片缺少 alt",
  TOUCH_TARGET: "互動目標過小",
  TOUCH_TARGET_MIN: "觸控目標未達 24px 最低標準",
  TOUCH_TARGET_COMFORT: "觸控目標低於 44px 舒適建議",
  A11Y_CONTROL_NAME: "互動元件缺少可辨識名稱",
  UX_AMBIGUOUS_LINK: "連結文字不夠明確",
  UX_LABEL_DESTINATION: "相同連結文字通往不同位置",
  RESPONSIVE_VIEWPORT_SCALE: "頁面版面寬於裝置視窗",
  RESPONSIVE_OVERFLOW: "元素超出畫面範圍",
  A11Y_CONTRAST: "文字對比不足",
  UX_REQUIRED_FIELD_GUIDANCE: "必填欄位缺少說明",
  STRUCTURE_MAIN: "缺少 main landmark",
  RUNTIME_NETWORK: "資源載入失敗",
  RUNTIME_JS: "JavaScript 執行錯誤",
  RUNTIME_LOG: "Console 錯誤"
};

const LIMITATIONS_ZH = [
  "UX 啟發式檢查只能指出潛在風險，不能取代真實使用者測試。",
  "對比檢查是依據計算後的文字顏色與祖先背景色進行估算。",
  "PoC 只檢查一個公開頁面，不會登入、送出表單或執行完整任務流程。"
];

const root = document.querySelector("#report-root");
const localeToggle = document.querySelector("#locale-toggle");
const copyPromptButton = document.querySelector("#copy-prompt");
const downloadMarkdownButton = document.querySelector("#download-markdown");
const downloadJsonButton = document.querySelector("#download-json");
const toast = document.querySelector("#toast");

let locale = "en";
let report = null;
let repairPrompt = "";
let auditMarkdown = "";

init();

async function init() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    applyStaticCopy();
    renderError("The report URL does not contain an audit id.");
    return;
  }

  const [response, stored] = await Promise.all([
    chrome.runtime.sendMessage({ type: "GET_REPORT", id }),
    chrome.storage.local.get(LOCALE_KEY)
  ]);
  locale = stored[LOCALE_KEY] === "zh-Hant" ? "zh-Hant" : "en";
  report = response?.report;
  applyStaticCopy();

  if (!report) {
    renderError("SiteProof could not find this report in local extension storage.");
    return;
  }

  repairPrompt = buildRepairPrompt(report);
  auditMarkdown = buildMarkdownReport(report, locale);
  renderReport(report);
}

localeToggle.addEventListener("click", async () => {
  locale = locale === "en" ? "zh-Hant" : "en";
  await chrome.storage.local.set({ [LOCALE_KEY]: locale });
  applyStaticCopy();
  if (report) {
    auditMarkdown = buildMarkdownReport(report, locale);
    renderReport(report);
  }
});

copyPromptButton.addEventListener("click", async () => {
  if (!repairPrompt) return;
  await navigator.clipboard.writeText(repairPrompt);
  showToast(COPY[locale].copied);
});

downloadMarkdownButton.addEventListener("click", () => {
  if (!auditMarkdown || !report) return;
  downloadText(
    `siteproof-report-${safeFileName(new URL(report.url).hostname)}-${report.id}.md`,
    auditMarkdown,
    "text/markdown"
  );
});

downloadJsonButton.addEventListener("click", () => {
  if (!report) return;
  downloadText(
    `siteproof-${safeFileName(new URL(report.url).hostname)}-${report.id}.json`,
    JSON.stringify(report, null, 2),
    "application/json"
  );
});

function applyStaticCopy() {
  const copy = COPY[locale];
  document.documentElement.lang = locale === "zh-Hant" ? "zh-Hant" : "en";
  localeToggle.textContent = copy.localeToggle;
  copyPromptButton.textContent = copy.copyPrompt;
  downloadMarkdownButton.textContent = copy.downloadMarkdown;
  downloadJsonButton.textContent = copy.downloadJson;
}

function renderReport(data) {
  const copy = COPY[locale];
  const counts = data.summary.counts;
  const viewportLabels = {
    desktop: ["Desktop", "1440 × 900"],
    tablet: ["Tablet", "768 × 1024"],
    mobile: ["Mobile", "390 × 844"]
  };

  root.innerHTML = `
    <section class="hero">
      <div>
        <p class="kicker">${escapeHtml(copy.kicker)} · ${escapeHtml(
          formatDate(data.completedAt)
        )}</p>
        <h1>${escapeHtml(new URL(data.url).hostname)}</h1>
        <a class="site-url" href="${escapeAttribute(
          data.url
        )}" target="_blank" rel="noreferrer">${escapeHtml(data.url)}</a>
      </div>
      <aside class="verdict-card">
        <p class="verdict-label">${escapeHtml(copy.verdictLabel)}</p>
        <p class="verdict ${escapeAttribute(data.summary.verdict)}">
          ${escapeHtml(copy.verdicts[data.summary.verdict] || data.summary.verdict)}
        </p>
        <p class="task"><strong>${escapeHtml(copy.taskLabel)}</strong><br />${escapeHtml(
          data.primaryTask
        )}</p>
      </aside>
    </section>

    <section class="summary-grid" aria-label="Issue summary">
      ${summaryItem(counts.blocker, copy.counts[0])}
      ${summaryItem(counts.major, copy.counts[1])}
      ${summaryItem(counts.minor, copy.counts[2])}
      ${summaryItem(counts.observation, copy.counts[3])}
      ${summaryItem(data.summary.total, copy.counts[4])}
    </section>

    <section class="section" id="screenshots">
      ${sectionHeading("01", copy.sections.screenshots)}
      <p class="section-intro">${escapeHtml(copy.intros.screenshots)}</p>
      <div class="screenshots-grid">
        ${Object.entries(viewportLabels)
          .map(([id, [label, size]]) =>
            screenshotCard(label, size, data.screenshots[id])
          )
          .join("")}
      </div>
    </section>

    <section class="section" id="findings">
      ${sectionHeading("02", copy.sections.findings)}
      <p class="section-intro">${escapeHtml(copy.intros.findings)}</p>
      <div class="findings-list">
        ${
          data.findings.length
            ? [...data.findings]
                .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
                .map(findingCard)
                .join("")
            : `<p class="empty-state">${escapeHtml(copy.noFindings)}</p>`
        }
      </div>
    </section>

    <section class="section" id="heuristics">
      ${sectionHeading("03", copy.sections.heuristics)}
      <p class="section-intro">${escapeHtml(copy.intros.heuristics)}</p>
      <div class="heuristics-grid">
        ${data.heuristicReview.map(heuristicCard).join("")}
      </div>
      <p class="source-note">
        ${escapeHtml(copy.sourceFramework)}:
        <a href="${escapeAttribute(
          data.heuristicSource.url
        )}" target="_blank" rel="noreferrer">${escapeHtml(
          data.heuristicSource.label
        )}</a>.<br />
        ${escapeHtml(copy.sourceDisclaimer)}
      </p>
    </section>

    <section class="section" id="limitations">
      ${sectionHeading("04", copy.sections.limitations)}
      <ul class="limitations">
        ${localizedLimitations(data.limitations)
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}
      </ul>
    </section>
  `;
}

function localizedLimitations(items) {
  return locale === "zh-Hant" ? LIMITATIONS_ZH : items;
}

function sectionHeading(index, title) {
  return `
    <div class="section-heading">
      <span class="section-index">${escapeHtml(index)}</span>
      <h2>${escapeHtml(title)}</h2>
    </div>
  `;
}

function summaryItem(value, name) {
  return `
    <div class="summary-item">
      <span class="summary-number">${Number(value || 0)}</span>
      <span class="summary-name">${escapeHtml(name)}</span>
    </div>
  `;
}

function screenshotCard(label, size, source) {
  return `
    <article class="shot-card">
      <div class="shot-meta">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(size)}</span>
      </div>
      ${
        source
          ? `<img src="${escapeAttribute(source)}" alt="${escapeAttribute(
              `${label} audit screenshot`
            )}" />`
          : `<p class="empty-state">${escapeHtml(
              COPY[locale].screenshotUnavailable
            )}</p>`
      }
    </article>
  `;
}

function findingCard(finding) {
  const copy = COPY[locale];
  const title =
    locale === "zh-Hant"
      ? FINDING_TITLE_ZH[finding.rule] || finding.title
      : finding.title;
  return `
    <article class="finding" id="${escapeAttribute(finding.id)}">
      <span class="severity ${escapeAttribute(finding.severity)}">${escapeHtml(
        finding.severity
      )}</span>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(finding.message)}</p>
        ${
          finding.element
            ? `<code class="element">${escapeHtml(finding.element)}</code>`
            : ""
        }
        <p class="element">${escapeHtml(copy.viewports)}: ${escapeHtml(
          finding.viewports?.join(", ") || copy.notViewportSpecific
        )}</p>
      </div>
      <pre class="evidence">${escapeHtml(
        JSON.stringify(finding.evidence || { rule: finding.rule }, null, 2)
      )}</pre>
    </article>
  `;
}

function heuristicCard(heuristic) {
  const copy = COPY[locale];
  const localized = heuristicTextFor(heuristic);
  const title = locale === "zh-Hant" ? localized.titleZh : localized.title;
  const secondaryTitle =
    locale === "zh-Hant" ? localized.title : localized.titleZh;
  const question =
    locale === "zh-Hant" ? localized.questionZh : localized.questionEn;
  return `
    <article class="heuristic">
      <div class="heuristic-top">
        <span class="heuristic-id">${escapeHtml(heuristic.id)}</span>
        <span class="heuristic-status ${escapeAttribute(
          heuristic.status
        )}">${escapeHtml(
          copy.heuristicStatus[heuristic.status] || heuristic.status
        )}</span>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <p class="en-title">${escapeHtml(secondaryTitle)}</p>
      <p class="question">${escapeHtml(question)}</p>
      ${
        heuristic.relatedFindings.length
          ? `<p class="related">${escapeHtml(copy.relatedEvidence)}: ${escapeHtml(
              heuristic.relatedFindings.join(", ")
            )}</p>`
          : ""
      }
    </article>
  `;
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

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(locale === "zh-Hant" ? "zh-TW" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-+|-+$/g, "");
}

function downloadText(filename, content, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 1800);
}

function renderError(message) {
  const copy = COPY[locale];
  root.innerHTML = `
    <section class="error-state">
      <p class="kicker">${escapeHtml(copy.errorKicker)}</p>
      <h1>${escapeHtml(copy.errorTitle)}</h1>
      <p>${escapeHtml(message)}</p>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
