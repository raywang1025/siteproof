import { collectPageEvidence } from "./core/page-audit.js";
import {
  buildReport,
  DEFAULT_PRIMARY_TASK,
  runtimeFinding,
  VIEWPORTS
} from "./core/report-builder.js";
import { uniqueRuntimeEvents } from "./core/runtime-events.js";

const RUN_STATE_KEY = "siteproofRunState";
let activeRun = null;

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    [RUN_STATE_KEY]: {
      status: "idle",
      message: "Ready to audit the active site."
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "GET_RUN_STATE") {
    chrome.storage.local.get(RUN_STATE_KEY).then((stored) => {
      sendResponse(stored[RUN_STATE_KEY] || { status: "idle" });
    });
    return true;
  }

  if (message?.type === "GET_REPORT") {
    const key = `siteproofReport:${message.id}`;
    chrome.storage.local.get(key).then((stored) => {
      sendResponse({ report: stored[key] || null });
    });
    return true;
  }

  if (message?.type === "START_AUDIT") {
    if (activeRun) {
      sendResponse({
        accepted: false,
        error: "Another audit is already running."
      });
      return false;
    }

    let targetUrl;
    try {
      targetUrl = normalizeUrl(message.url);
    } catch (error) {
      sendResponse({ accepted: false, error: error.message });
      return false;
    }

    const id = crypto.randomUUID();
    const primaryTask = message.primaryTask?.trim() || DEFAULT_PRIMARY_TASK;
    activeRun = runAudit({ id, url: targetUrl, primaryTask })
      .catch(async (error) => {
        await setRunState({
          status: "failed",
          id,
          url: targetUrl,
          message: error instanceof Error ? error.message : String(error)
        });
      })
      .finally(() => {
        activeRun = null;
      });

    sendResponse({ accepted: true, id });
    return false;
  }

  return false;
});

function normalizeUrl(value) {
  const candidate = new URL(value);
  if (!["http:", "https:"].includes(candidate.protocol)) {
    throw new Error("SiteProof can audit only HTTP or HTTPS pages.");
  }
  candidate.hash = "";
  return candidate.toString();
}

async function setRunState(nextState) {
  await chrome.storage.local.set({
    [RUN_STATE_KEY]: {
      updatedAt: new Date().toISOString(),
      ...nextState
    }
  });
}

async function runAudit({ id, url, primaryTask }) {
  const startedAt = new Date().toISOString();
  const viewportResults = [];
  const runtimeFindings = [];
  const screenshots = {};

  await setRunState({
    status: "running",
    id,
    url,
    progress: 0,
    message: "Preparing isolated audit tabs…"
  });

  for (let index = 0; index < VIEWPORTS.length; index += 1) {
    const viewport = VIEWPORTS[index];
    await setRunState({
      status: "running",
      id,
      url,
      viewport: viewport.id,
      progress: Math.round((index / VIEWPORTS.length) * 90),
      message: `Auditing ${viewport.label} · ${viewport.width} × ${viewport.height}`
    });

    const result = await auditViewport({ url, viewport });
    viewportResults.push(result.evidence);
    screenshots[viewport.id] = result.screenshot;
    runtimeFindings.push(...result.runtimeFindings);
  }

  await setRunState({
    status: "running",
    id,
    url,
    progress: 94,
    message: "Building the evidence report…"
  });

  const report = buildReport({
    id,
    url,
    startedAt,
    completedAt: new Date().toISOString(),
    primaryTask,
    viewportResults,
    runtimeFindings,
    screenshots
  });

  const reportKey = `siteproofReport:${id}`;
  await chrome.storage.local.set({
    [reportKey]: report,
    siteproofLatestReportId: id
  });

  await setRunState({
    status: "complete",
    id,
    url,
    progress: 100,
    reportUrl: chrome.runtime.getURL(`src/report/report.html?id=${id}`),
    message: "Audit complete."
  });

  await chrome.tabs.create({
    url: chrome.runtime.getURL(`src/report/report.html?id=${id}`),
    active: true
  });
}

async function auditViewport({ url, viewport }) {
  const tab = await chrome.tabs.create({
    url: "about:blank",
    active: false
  });
  const debuggee = { tabId: tab.id };
  const events = [];
  let attached = false;

  const eventListener = (source, method, params) => {
    if (source.tabId !== tab.id) return;

    if (method === "Runtime.exceptionThrown") {
      events.push({
        type: "exception",
        message:
          params.exceptionDetails?.exception?.description ||
          params.exceptionDetails?.text ||
          "Uncaught JavaScript exception",
        url: params.exceptionDetails?.url || null
      });
    }

    if (method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(params.type)) {
      const message = (params.args || [])
        .map((arg) => arg.value ?? arg.description ?? arg.type)
        .join(" ");
      events.push({
        type: "console",
        message: message || `console.${params.type}`,
        url: null
      });
    }

    if (method === "Log.entryAdded" && params.entry?.level === "error") {
      events.push({
        type: "console",
        message: params.entry.text || "Console error",
        url: params.entry.url || null
      });
    }

    if (method === "Network.responseReceived" && params.response?.status >= 400) {
      events.push({
        type: "network",
        message: `${Math.round(params.response.status)} ${params.response.statusText || ""}`.trim(),
        url: params.response.url || null,
        status: Math.round(params.response.status)
      });
    }

    if (
      method === "Network.loadingFailed" &&
      !params.canceled &&
      params.errorText !== "net::ERR_ABORTED"
    ) {
      events.push({
        type: "network",
        message: params.errorText || "Network loading failed",
        url: null,
        status: null
      });
    }
  };

  try {
    await chrome.debugger.attach(debuggee, "1.3");
    attached = true;
    chrome.debugger.onEvent.addListener(eventListener);

    await Promise.all([
      command(debuggee, "Page.enable"),
      command(debuggee, "Network.enable"),
      command(debuggee, "Runtime.enable"),
      command(debuggee, "Log.enable")
    ]);

    await command(debuggee, "Emulation.setDeviceMetricsOverride", {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      mobile: viewport.mobile,
      screenWidth: viewport.width,
      screenHeight: viewport.height
    });

    const loadPromise = waitForCdpEvent(tab.id, "Page.loadEventFired", 20000);
    const navigation = await command(debuggee, "Page.navigate", { url });
    if (navigation?.errorText) {
      throw new Error(`${viewport.label} navigation failed: ${navigation.errorText}`);
    }
    await loadPromise;
    await wait(900);

    const evaluation = await command(debuggee, "Runtime.evaluate", {
      expression: `(${collectPageEvidence.toString()})(${JSON.stringify(viewport)})`,
      returnByValue: true,
      awaitPromise: true
    });
    if (evaluation?.exceptionDetails) {
      throw new Error(
        evaluation.exceptionDetails.exception?.description ||
          evaluation.exceptionDetails.text ||
          `${viewport.label} page evaluation failed.`
      );
    }

    const screenshotResult = await command(debuggee, "Page.captureScreenshot", {
      format: "jpeg",
      quality: 68,
      fromSurface: true,
      captureBeyondViewport: false
    });

    return {
      evidence: evaluation.result.value,
      screenshot: `data:image/jpeg;base64,${screenshotResult.data}`,
      runtimeFindings: uniqueRuntimeEvents(events)
        .slice(0, 100)
        .map((event) =>
          runtimeFinding({
            viewport: viewport.id,
            type: event.type,
            message: event.message,
            url: event.url,
            status: event.status
          })
        )
    };
  } finally {
    chrome.debugger.onEvent.removeListener(eventListener);
    if (attached) {
      try {
        await chrome.debugger.detach(debuggee);
      } catch {
        // The tab may already have closed after a failed navigation.
      }
    }
    try {
      await chrome.tabs.remove(tab.id);
    } catch {
      // No action needed if Chrome already removed the temporary tab.
    }
  }
}

function command(debuggee, method, params = {}) {
  return chrome.debugger.sendCommand(debuggee, method, params);
}

function waitForCdpEvent(tabId, expectedMethod, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.debugger.onEvent.removeListener(listener);
      reject(new Error(`Timed out waiting for ${expectedMethod}.`));
    }, timeoutMs);

    const listener = (source, method, params) => {
      if (source.tabId !== tabId || method !== expectedMethod) return;
      clearTimeout(timer);
      chrome.debugger.onEvent.removeListener(listener);
      resolve(params);
    };

    chrome.debugger.onEvent.addListener(listener);
  });
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
