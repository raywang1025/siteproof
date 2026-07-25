const LOCALE_KEY = "siteproofLocale";
const DEFAULT_TASKS = {
  en: "A first-time visitor can understand what the site offers, find the key information, and identify the primary next step.",
  "zh-Hant":
    "第一次造訪的人，能理解這個網站提供什麼、找到關鍵資訊，並知道下一步該做什麼。"
};

const COPY = {
  en: {
    intro: "Find what an AI-built website still needs before launch.",
    urlLabel: "Website URL",
    taskLabel: "Primary user task",
    start: "Start audit",
    openReport: "Open latest report",
    privacy:
      "Analysis stays local. SiteProof uses Debugger access for load errors, device emulation, and screenshots.",
    status: {
      idle: "Ready",
      running: "Auditing",
      complete: "Audit complete",
      failed: "Audit failed"
    },
    idleMessage: "Open the site you want to check, then start the audit.",
    starting: "Starting an isolated audit…",
    genericError: "Could not start the audit.",
    toggle: "中文"
  },
  "zh-Hant": {
    intro: "檢查 AI 做出的網站，距離可以上線還差什麼。",
    urlLabel: "網站網址",
    taskLabel: "主要使用者任務",
    start: "開始驗收",
    openReport: "開啟最新報告",
    privacy:
      "分析在本機完成。SiteProof 使用 Debugger 權限取得載入錯誤、模擬裝置與截圖。",
    status: {
      idle: "準備完成",
      running: "正在驗收",
      complete: "驗收完成",
      failed: "驗收失敗"
    },
    idleMessage: "開啟想檢查的網站，再按開始驗收。",
    starting: "正在建立隔離的檢查環境…",
    genericError: "無法開始驗收。",
    toggle: "English"
  }
};

const form = document.querySelector("#audit-form");
const urlInput = document.querySelector("#url");
const taskInput = document.querySelector("#primary-task");
const startButton = document.querySelector("#start-button");
const localeToggle = document.querySelector("#locale-toggle");
const statusDot = document.querySelector("#status-dot");
const statusTitle = document.querySelector("#status-title");
const statusMessage = document.querySelector("#status-message");
const progressBar = document.querySelector("#progress-bar");
const reportLink = document.querySelector("#report-link");

let locale = "en";
let lastState = { status: "idle" };
let pollTimer = null;

init();

async function init() {
  const stored = await chrome.storage.local.get(LOCALE_KEY);
  locale = stored[LOCALE_KEY] === "zh-Hant" ? "zh-Hant" : "en";
  taskInput.value = DEFAULT_TASKS[locale];
  applyLocale();

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.url?.startsWith("http")) {
    urlInput.value = activeTab.url;
  } else {
    urlInput.value = "";
  }

  await refreshState();
}

localeToggle.addEventListener("click", async () => {
  const previousLocale = locale;
  locale = locale === "en" ? "zh-Hant" : "en";
  if (
    !taskInput.value.trim() ||
    taskInput.value.trim() === DEFAULT_TASKS[previousLocale]
  ) {
    taskInput.value = DEFAULT_TASKS[locale];
  }
  await chrome.storage.local.set({ [LOCALE_KEY]: locale });
  applyLocale();
  setVisualState(lastState);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  startButton.disabled = true;
  reportLink.hidden = true;
  setVisualState({
    status: "running",
    progress: 1,
    message: COPY[locale].starting
  });

  const response = await chrome.runtime.sendMessage({
    type: "START_AUDIT",
    url: urlInput.value,
    primaryTask: taskInput.value
  });

  if (!response?.accepted) {
    setVisualState({
      status: "failed",
      message: response?.error || COPY[locale].genericError
    });
    startButton.disabled = false;
    return;
  }

  startPolling();
});

async function refreshState() {
  const state = await chrome.runtime.sendMessage({ type: "GET_RUN_STATE" });
  setVisualState(state || { status: "idle" });

  if (state?.status === "running") {
    startButton.disabled = true;
    startPolling();
  }
}

function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    const state = await chrome.runtime.sendMessage({ type: "GET_RUN_STATE" });
    setVisualState(state);
    if (["complete", "failed"].includes(state?.status)) {
      clearInterval(pollTimer);
      startButton.disabled = false;
    }
  }, 500);
}

function applyLocale() {
  document.documentElement.lang = locale === "zh-Hant" ? "zh-Hant" : "en";
  for (const element of document.querySelectorAll("[data-i18n]")) {
    const key = element.dataset.i18n;
    if (COPY[locale][key]) element.textContent = COPY[locale][key];
  }
  localeToggle.textContent = COPY[locale].toggle;
}

function setVisualState(state = {}) {
  lastState = state;
  const status = state.status || "idle";
  const localizedStatus = COPY[locale].status[status] || status;

  statusDot.className = `status-dot ${status}`;
  statusTitle.textContent = localizedStatus;
  statusMessage.textContent =
    state.message ||
    (status === "idle" ? COPY[locale].idleMessage : localizedStatus);
  progressBar.style.width = `${state.progress || 0}%`;

  if (state.reportUrl) {
    reportLink.hidden = false;
    reportLink.href = state.reportUrl;
    reportLink.onclick = (event) => {
      event.preventDefault();
      chrome.tabs.create({ url: state.reportUrl });
    };
  }
}
