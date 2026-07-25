export function uniqueRuntimeEvents(events = []) {
  const networkFailureUrls = new Set(
    events
      .filter((event) => event.type === "network" && event.url)
      .map((event) => event.url)
  );
  const seen = new Set();

  return events.filter((event) => {
    const duplicatesNetworkEvidence =
      event.type === "console" &&
      event.url &&
      networkFailureUrls.has(event.url) &&
      /^Failed to load resource:/i.test(event.message || "");
    if (duplicatesNetworkEvidence) return false;

    const key = `${event.type}:${event.message}:${event.url || ""}:${
      event.status || ""
    }`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
