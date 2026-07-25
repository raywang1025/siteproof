import test from "node:test";
import assert from "node:assert/strict";

import { uniqueRuntimeEvents } from "../src/core/runtime-events.js";

test("keeps one root finding when a failed resource also appears in Console", () => {
  const events = uniqueRuntimeEvents([
    {
      type: "network",
      message: "404 Not Found",
      url: "https://example.com/missing.jpg",
      status: 404
    },
    {
      type: "console",
      message:
        "Failed to load resource: the server responded with a status of 404 (Not Found)",
      url: "https://example.com/missing.jpg",
      status: null
    }
  ]);

  assert.equal(events.length, 1);
  assert.equal(events[0].type, "network");
});

test("keeps explicit Console errors and removes exact duplicates", () => {
  const event = {
    type: "console",
    message: "Application state is invalid",
    url: null,
    status: null
  };
  const events = uniqueRuntimeEvents([event, event]);

  assert.deepEqual(events, [event]);
});
